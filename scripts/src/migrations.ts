import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg, { type PoolClient } from "pg";

const { Pool } = pg;
const MIGRATIONS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../db/migrations");
const MIGRATION_LOCK_KEY = 705_2026;

type MigrationFile = { id: string; path: string; sql: string; checksum: string };

function requireDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is required for database migrations.");
  return value;
}

async function migrationFiles(): Promise<MigrationFile[]> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => /^\d+_[a-z0-9_-]+\.sql$/i.test(file)).sort();
  const migrations = await Promise.all(files.map(async (file) => {
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    return {
      id: file.replace(/\.sql$/i, ""),
      path: join(MIGRATIONS_DIR, file),
      sql,
      checksum: createHash("sha256").update(sql).digest("hex"),
    };
  }));
  if (!migrations.length) throw new Error(`No migration files found in ${MIGRATIONS_DIR}`);
  return migrations;
}

async function ensureMigrationTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function initialSchemaIsCompatible(client: PoolClient): Promise<boolean> {
  const requiredTables = [
    "admin_users", "admin_sessions", "nationalities", "skills", "workers",
    "worker_skills", "worker_media", "content_blocks", "system_settings", "audit_logs",
  ];
  const requiredEnums = ["admin_role", "worker_availability_status", "publication_status", "media_visibility"];
  const tableResult = await client.query<{ name: string }>(
    `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [requiredTables],
  );
  const enumResult = await client.query<{ name: string }>(
    `SELECT typname AS name FROM pg_type WHERE typtype = 'e' AND typname = ANY($1::text[])`,
    [requiredEnums],
  );
  if (tableResult.rowCount !== requiredTables.length || enumResult.rowCount !== requiredEnums.length) return false;

  const requiredColumns: Record<string, string[]> = {
    admin_users: ["id", "email", "password_hash", "display_name", "role", "is_active"],
    admin_sessions: ["token_hash", "admin_user_id", "expires_at"],
    nationalities: ["id", "name_en", "name_ar", "slug", "is_active", "sort_order"],
    skills: ["id", "name_en", "name_ar", "slug", "is_active", "sort_order"],
    workers: ["id", "public_code", "display_name", "slug", "nationality_id", "languages", "availability_status", "publication_status"],
    worker_skills: ["worker_id", "skill_id"],
    worker_media: ["id", "worker_id", "url", "visibility", "is_primary", "alt_text_ar"],
    content_blocks: ["id", "key", "content_en", "content_ar", "is_active"],
    system_settings: ["id", "key", "value"],
    audit_logs: ["id", "actor_admin_id", "action", "entity_type", "entity_id", "after_json"],
  };
  for (const [table, columns] of Object.entries(requiredColumns)) {
    const result = await client.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = ANY($2::text[])`,
      [table, columns],
    );
    if (Number(result.rows[0]?.count || 0) !== columns.length) return false;
  }
  return true;
}

async function readApplied(client: PoolClient): Promise<Map<string, string>> {
  const result = await client.query<{ id: string; checksum: string }>("SELECT id, checksum FROM schema_migrations ORDER BY id");
  return new Map(result.rows.map((row) => [row.id, row.checksum]));
}

async function migrate(): Promise<void> {
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();
  try {
    const files = await migrationFiles();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [MIGRATION_LOCK_KEY]);
    await ensureMigrationTable(client);
    const applied = await readApplied(client);
    for (const file of files) {
      const previousChecksum = applied.get(file.id);
      if (previousChecksum) {
        if (previousChecksum !== file.checksum) throw new Error(`Migration checksum mismatch for ${file.id}; restore the recorded file or create a new migration.`);
        continue;
      }
      if (file.id === files[0].id && applied.size === 0 && await initialSchemaIsCompatible(client)) {
        await client.query("INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2)", [file.id, file.checksum]);
        console.log(`baseline ${file.id} (existing compatible schema adopted)`);
        continue;
      }
      await client.query(file.sql);
      await client.query("INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2)", [file.id, file.checksum]);
      console.log(`applied ${file.id}`);
    }
    await client.query("COMMIT");
    console.log("database migrations complete");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function status(): Promise<void> {
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();
  try {
    const files = await migrationFiles();
    const table = await client.query<{ exists: boolean }>("SELECT to_regclass('public.schema_migrations') IS NOT NULL AS exists");
    if (!table.rows[0]?.exists) {
      console.log("schema_migrations: NOT INITIALIZED");
      for (const file of files) console.log(`${file.id}: PENDING`);
      return;
    }
    const applied = await readApplied(client);
    for (const file of files) {
      const checksum = applied.get(file.id);
      if (!checksum) console.log(`${file.id}: PENDING`);
      else if (checksum !== file.checksum) console.log(`${file.id}: CHECKSUM_MISMATCH`);
      else console.log(`${file.id}: APPLIED`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

const command = process.argv[2] || "migrate";
try {
  if (command === "status") await status();
  else if (command === "migrate") await migrate();
  else throw new Error(`Unknown database command: ${command}. Use migrate or status.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
