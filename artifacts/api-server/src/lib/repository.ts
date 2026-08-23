import { requirePool } from "@workspace/db";
import type { Pool, PoolClient, QueryResultRow } from "pg";
import { id, publicCode, slugify } from "./ids";
import { ensureSchema } from "./schema";

export type PublicWorker = {
  publicCode: string;
  displayName: string;
  slug: string;
  nationality: { slug: string; nameAr: string; nameEn: string };
  age: number | null;
  city: string | null;
  yearsExperience: number | null;
  saudiExperienceYears: number | null;
  summary: string;
  languages: string[];
  skills: string[];
  availabilityStatus: string;
  isFeatured: boolean;
  media: Array<{ url: string; altTextAr: string | null; isPrimary: boolean }>;
};

export type AdminWorkerInput = {
  publicCode?: string;
  displayName?: string;
  slug?: string;
  nationalityId?: string;
  age?: number | null;
  currentCity?: string | null;
  yearsExperience?: number | null;
  saudiExperienceYears?: number | null;
  publicSummaryEn?: string | null;
  publicSummaryAr?: string | null;
  languages?: string[];
  internalNotes?: string | null;
  availabilityStatus?: string;
  publicationStatus?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  skillIds?: string[];
};

async function pool(): Promise<Pool> {
  await ensureSchema();
  return requirePool();
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function hydrateWorkers(client: Pool, rows: QueryResultRow[]): Promise<PublicWorker[]> {
  if (!rows.length) return [];
  const workerIds = rows.map((row) => row.id as string);
  const [skillRows, mediaRows] = await Promise.all([
    client.query(`SELECT ws.worker_id, s.name_ar, s.name_en FROM worker_skills ws JOIN skills s ON s.id = ws.skill_id WHERE ws.worker_id = ANY($1::text[]) AND s.is_active = true ORDER BY s.sort_order, s.name_ar`, [workerIds]),
    client.query(`SELECT worker_id, url, alt_text_ar, is_primary FROM worker_media WHERE worker_id = ANY($1::text[]) AND visibility = 'PUBLIC' ORDER BY is_primary DESC, created_at`, [workerIds]),
  ]);
  const skillsByWorker = new Map<string, string[]>();
  for (const row of skillRows.rows) {
    const values = skillsByWorker.get(row.worker_id) ?? [];
    values.push(row.name_ar || row.name_en);
    skillsByWorker.set(row.worker_id, values);
  }
  const mediaByWorker = new Map<string, PublicWorker["media"]>();
  for (const row of mediaRows.rows) {
    const values = mediaByWorker.get(row.worker_id) ?? [];
    values.push({ url: row.url, altTextAr: row.alt_text_ar, isPrimary: row.is_primary });
    mediaByWorker.set(row.worker_id, values);
  }
  return rows.map((row) => ({
    publicCode: row.public_code,
    displayName: row.display_name,
    slug: row.slug,
    nationality: { slug: row.nationality_slug, nameAr: row.nationality_name_ar, nameEn: row.nationality_name_en },
    age: row.age,
    city: row.current_city,
    yearsExperience: row.years_experience,
    saudiExperienceYears: row.saudi_experience_years,
    summary: row.public_summary_ar || row.public_summary_en || "",
    languages: asArray(row.languages),
    skills: skillsByWorker.get(row.id) ?? [],
    availabilityStatus: row.availability_status,
    isFeatured: row.is_featured,
    media: mediaByWorker.get(row.id) ?? [],
  }));
}

export async function listPublicWorkers(filters: { query?: string; nationality?: string; skill?: string; availability?: string } = {}): Promise<PublicWorker[]> {
  const client = await pool();
  const values: unknown[] = [];
  const where = ["w.publication_status = 'PUBLISHED'", "n.is_active = true"];
  if (filters.query?.trim()) {
    values.push(`%${filters.query.trim()}%`);
    where.push(`(w.display_name ILIKE $${values.length} OR w.public_code ILIKE $${values.length} OR w.current_city ILIKE $${values.length} OR w.public_summary_ar ILIKE $${values.length} OR w.public_summary_en ILIKE $${values.length})`);
  }
  if (filters.nationality?.trim()) {
    values.push(filters.nationality.trim());
    where.push(`n.slug = $${values.length}`);
  }
  if (filters.availability?.trim()) {
    values.push(filters.availability.trim());
    where.push(`w.availability_status = $${values.length}`);
  }
  if (filters.skill?.trim()) {
    values.push(filters.skill.trim());
    where.push(`EXISTS (SELECT 1 FROM worker_skills wsf JOIN skills sf ON sf.id = wsf.skill_id WHERE wsf.worker_id = w.id AND sf.slug = $${values.length} AND sf.is_active = true)`);
  }
  const result = await client.query(`
    SELECT w.*, n.slug AS nationality_slug, n.name_ar AS nationality_name_ar, n.name_en AS nationality_name_en
    FROM workers w JOIN nationalities n ON n.id = w.nationality_id
    WHERE ${where.join(" AND ")}
    ORDER BY w.is_featured DESC, w.sort_order ASC, w.created_at DESC
  `, values);
  return hydrateWorkers(client, result.rows);
}

export async function getPublicWorker(slugOrCode: string): Promise<PublicWorker | null> {
  const client = await pool();
  const result = await client.query(`
    SELECT w.*, n.slug AS nationality_slug, n.name_ar AS nationality_name_ar, n.name_en AS nationality_name_en
    FROM workers w JOIN nationalities n ON n.id = w.nationality_id
      WHERE w.publication_status = 'PUBLISHED' AND n.is_active = true AND (w.slug = $1 OR w.public_code = $1)
    LIMIT 1
  `, [slugOrCode]);
  const workers = await hydrateWorkers(client, result.rows);
  return workers[0] ?? null;
}

export async function listNationalities(activeOnly = true): Promise<Array<Record<string, unknown>>> {
  const client = await pool();
  const result = await client.query(`SELECT id, name_en AS "nameEn", name_ar AS "nameAr", slug, is_active AS "isActive", sort_order AS "sortOrder" FROM nationalities ${activeOnly ? "WHERE is_active = true" : ""} ORDER BY sort_order, name_ar`);
  return result.rows;
}

export async function listSkills(activeOnly = true): Promise<Array<Record<string, unknown>>> {
  const client = await pool();
  const result = await client.query(`SELECT id, name_en AS "nameEn", name_ar AS "nameAr", slug, is_active AS "isActive", sort_order AS "sortOrder" FROM skills ${activeOnly ? "WHERE is_active = true" : ""} ORDER BY sort_order, name_ar`);
  return result.rows;
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  const client = await pool();
  const result = await client.query(`SELECT key, value FROM system_settings WHERE key IN ('whatsappNumber','phoneNumber')`);
  const settings: Record<string, string> = {};
  for (const row of result.rows) {
    if (typeof row.value === "string") settings[row.key] = row.value;
    else if (row.value && typeof row.value.value === "string") settings[row.key] = row.value.value;
  }
  if (!settings.whatsappNumber && process.env.AHD_WHATSAPP_NUMBER) settings.whatsappNumber = process.env.AHD_WHATSAPP_NUMBER;
  if (!settings.phoneNumber && process.env.AHD_PUBLIC_PHONE) settings.phoneNumber = process.env.AHD_PUBLIC_PHONE;
  return settings;
}

export async function getAdminByEmail(email: string): Promise<{ id: string; email: string; passwordHash: string; displayName: string; role: string; isActive: boolean } | null> {
  const client = await pool();
  const result = await client.query(`SELECT id, email, password_hash AS "passwordHash", display_name AS "displayName", role, is_active AS "isActive" FROM admin_users WHERE lower(email) = lower($1) LIMIT 1`, [email]);
  return result.rows[0] ?? null;
}

export async function ensureBootstrapAdmin(passwordHash: string): Promise<void> {
  const email = process.env.AHD_ADMIN_EMAIL?.trim();
  const password = process.env.AHD_ADMIN_PASSWORD;
  if (!email || !password) return;
  const client = await pool();
  await client.query(`INSERT INTO admin_users (id,email,password_hash,display_name,role) VALUES ($1,$2,$3,$4,'SUPER_ADMIN') ON CONFLICT (email) DO NOTHING`, [id(), email, passwordHash, process.env.AHD_ADMIN_NAME?.trim() || "AHD Admin"]);
}

export async function createSession(adminUserId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  const client = await pool();
  await client.query(`INSERT INTO admin_sessions (token_hash, admin_user_id, expires_at) VALUES ($1,$2,$3)`, [tokenHash, adminUserId, expiresAt]);
}

export async function getSessionAdmin(tokenHash: string): Promise<{ id: string; email: string; displayName: string; role: string } | null> {
  const client = await pool();
  const result = await client.query(`SELECT u.id, u.email, u.display_name AS "displayName", u.role FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_user_id WHERE s.token_hash = $1 AND s.expires_at > now() AND u.is_active = true`, [tokenHash]);
  return result.rows[0] ?? null;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  const client = await pool();
  await client.query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [tokenHash]);
}

export async function listAdminWorkers(): Promise<Array<Record<string, unknown>>> {
  const client = await pool();
  const result = await client.query(`
    SELECT w.*, n.name_ar AS nationality_name_ar, n.name_en AS nationality_name_en, n.slug AS nationality_slug,
      COALESCE((SELECT json_agg(ws.skill_id ORDER BY ws.skill_id) FROM worker_skills ws WHERE ws.worker_id = w.id), '[]'::json) AS skill_ids,
      COALESCE((SELECT json_agg(json_build_object('id', wm.id, 'url', wm.url, 'altTextAr', wm.alt_text_ar, 'visibility', wm.visibility, 'isPrimary', wm.is_primary) ORDER BY wm.is_primary DESC, wm.created_at) FROM worker_media wm WHERE wm.worker_id = w.id), '[]'::json) AS media
    FROM workers w JOIN nationalities n ON n.id = w.nationality_id
    ORDER BY w.is_featured DESC, w.sort_order, w.created_at DESC
  `);
  return result.rows;
}

export async function adminWorkerExists(workerId: string): Promise<boolean> {
  const client = await pool();
  return (await client.query(`SELECT 1 FROM workers WHERE id = $1 LIMIT 1`, [workerId])).rowCount === 1;
}

export async function createWorker(input: AdminWorkerInput & { displayName: string; nationalityId: string }): Promise<Record<string, unknown>> {
  const dbPool = await pool();
  const client = await dbPool.connect();
  const workerId = id();
  try {
    await client.query("BEGIN");
    const code = publicCode(input.publicCode || workerId.slice(-6));
    const slug = slugify(input.slug || input.displayName);
    const result = await client.query(`INSERT INTO workers (id,public_code,display_name,slug,nationality_id,age,current_city,years_experience,saudi_experience_years,public_summary_en,public_summary_ar,languages,internal_notes,availability_status,publication_status,is_featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`, [workerId, code, input.displayName.trim(), slug, input.nationalityId, input.age ?? null, input.currentCity ?? null, input.yearsExperience ?? null, input.saudiExperienceYears ?? null, input.publicSummaryEn ?? null, input.publicSummaryAr ?? null, input.languages ?? [], input.internalNotes ?? null, input.availabilityStatus || "AVAILABLE", input.publicationStatus || "DRAFT", Boolean(input.isFeatured), input.sortOrder ?? 0]);
    await replaceWorkerSkills(client, workerId, input.skillIds ?? []);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateWorker(workerId: string, input: AdminWorkerInput): Promise<Record<string, unknown> | null> {
  const dbPool = await pool();
  const client = await dbPool.connect();
  const assignments: string[] = [];
  const values: unknown[] = [workerId];
  const set = (column: string, value: unknown) => { values.push(value); assignments.push(`${column} = $${values.length}`); };
  if (input.publicCode !== undefined) set("public_code", publicCode(input.publicCode));
  if (input.displayName !== undefined) set("display_name", input.displayName.trim());
  if (input.slug !== undefined) set("slug", slugify(input.slug));
  if (input.nationalityId !== undefined) set("nationality_id", input.nationalityId);
  if (input.age !== undefined) set("age", input.age);
  if (input.currentCity !== undefined) set("current_city", input.currentCity);
  if (input.yearsExperience !== undefined) set("years_experience", input.yearsExperience);
  if (input.saudiExperienceYears !== undefined) set("saudi_experience_years", input.saudiExperienceYears);
  if (input.publicSummaryEn !== undefined) set("public_summary_en", input.publicSummaryEn);
  if (input.publicSummaryAr !== undefined) set("public_summary_ar", input.publicSummaryAr);
  if (input.languages !== undefined) set("languages", input.languages);
  if (input.internalNotes !== undefined) set("internal_notes", input.internalNotes);
  if (input.availabilityStatus !== undefined) set("availability_status", input.availabilityStatus);
  if (input.publicationStatus !== undefined) set("publication_status", input.publicationStatus);
  if (input.isFeatured !== undefined) set("is_featured", input.isFeatured);
  if (input.sortOrder !== undefined) set("sort_order", input.sortOrder);
  try {
    await client.query("BEGIN");
    if (!assignments.length && input.skillIds === undefined) {
      const worker = (await client.query(`SELECT * FROM workers WHERE id = $1`, [workerId])).rows[0] ?? null;
      await client.query("COMMIT");
      return worker;
    }
    let worker: Record<string, unknown> | null = null;
    if (assignments.length) {
      assignments.push("updated_at = now()");
      const result = await client.query(`UPDATE workers SET ${assignments.join(", ")} WHERE id = $1 RETURNING *`, values);
      worker = result.rows[0] ?? null;
    } else {
      worker = (await client.query(`SELECT * FROM workers WHERE id = $1`, [workerId])).rows[0] ?? null;
    }
    if (!worker) {
      await client.query("COMMIT");
      return null;
    }
    if (input.skillIds) await replaceWorkerSkills(client, workerId, input.skillIds);
    await client.query("COMMIT");
    return worker;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function replaceWorkerSkills(client: PoolClient, workerId: string, skillIds: string[]): Promise<void> {
  await client.query(`DELETE FROM worker_skills WHERE worker_id = $1`, [workerId]);
  if (!skillIds.length) return;
  await client.query(`INSERT INTO worker_skills (worker_id, skill_id) SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING`, [workerId, skillIds]);
}

export async function updateWorkerStatus(workerId: string, status: string): Promise<Record<string, unknown> | null> {
  const client = await pool();
  const result = await client.query(`UPDATE workers SET publication_status = $2::publication_status, published_at = CASE WHEN $2::publication_status = 'PUBLISHED'::publication_status THEN COALESCE(published_at, now()) ELSE published_at END, archived_at = CASE WHEN $2::publication_status = 'ARCHIVED'::publication_status THEN now() ELSE archived_at END, updated_at = now() WHERE id = $1 RETURNING *`, [workerId, status]);
  return result.rows[0] ?? null;
}

export async function updateWorkerAvailability(workerId: string, status: string): Promise<Record<string, unknown> | null> {
  const client = await pool();
  const result = await client.query(`UPDATE workers SET availability_status = $2, updated_at = now() WHERE id = $1 RETURNING *`, [workerId, status]);
  return result.rows[0] ?? null;
}

export async function upsertTaxonomy(kind: "nationalities" | "skills", input: { id?: string; nameEn: string; nameAr: string; slug?: string; isActive?: boolean; sortOrder?: number }): Promise<Record<string, unknown>> {
  const client = await pool();
  const table = kind;
  const entityId = input.id || id();
  const result = await client.query(`INSERT INTO ${table} (id,name_en,name_ar,slug,is_active,sort_order) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, slug = EXCLUDED.slug, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order, updated_at = now() RETURNING id,name_en AS "nameEn",name_ar AS "nameAr",slug,is_active AS "isActive",sort_order AS "sortOrder"`, [entityId, input.nameEn.trim(), input.nameAr.trim(), slugify(input.slug || input.nameEn), input.isActive ?? true, input.sortOrder ?? 0]);
  return result.rows[0];
}

export async function upsertSetting(key: string, value: string): Promise<Record<string, unknown>> {
  const client = await pool();
  const result = await client.query(`INSERT INTO system_settings (id,key,value) VALUES ($1,$2,$3::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now() RETURNING key,value`, [id(), key, JSON.stringify(value)]);
  return result.rows[0];
}

export async function getSetting(key: string): Promise<Record<string, unknown> | null> {
  const client = await pool();
  return (await client.query(`SELECT key, value, updated_at AS "updatedAt" FROM system_settings WHERE key = $1`, [key])).rows[0] ?? null;
}

export async function getContentBlock(key: string, activeOnly = true): Promise<Record<string, unknown> | null> {
  const client = await pool();
  const result = await client.query(`SELECT key, content_en AS "contentEn", content_ar AS "contentAr", is_active AS "isActive", updated_at AS "updatedAt" FROM content_blocks WHERE key = $1 ${activeOnly ? "AND is_active = true" : ""}`, [key]);
  return result.rows[0] ?? null;
}

export async function upsertContentBlock(key: string, input: { contentEn?: unknown; contentAr?: unknown; isActive?: boolean }): Promise<Record<string, unknown>> {
  const client = await pool();
  const result = await client.query(`
    INSERT INTO content_blocks (id,key,content_en,content_ar,is_active) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5)
    ON CONFLICT (key) DO UPDATE SET
      content_en = COALESCE(EXCLUDED.content_en, content_blocks.content_en),
      content_ar = COALESCE(EXCLUDED.content_ar, content_blocks.content_ar),
      is_active = EXCLUDED.is_active,
      updated_at = now()
    RETURNING key, content_en AS "contentEn", content_ar AS "contentAr", is_active AS "isActive", updated_at AS "updatedAt"
  `, [id(), key, input.contentEn === undefined ? null : JSON.stringify(input.contentEn), input.contentAr === undefined ? null : JSON.stringify(input.contentAr), input.isActive ?? true]);
  return result.rows[0];
}

export async function saveWorkerMedia(input: { id?: string; workerId: string; url: string; altTextAr?: string | null; visibility?: string; isPrimary?: boolean }): Promise<Record<string, unknown> | null> {
  const dbPool = await pool();
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    if (input.id) {
      const owned = await client.query(`SELECT 1 FROM worker_media WHERE id = $1 AND worker_id = $2`, [input.id, input.workerId]);
      if (!owned.rowCount) {
        await client.query("ROLLBACK");
        return null;
      }
    }
    if (input.isPrimary) await client.query(`UPDATE worker_media SET is_primary = false WHERE worker_id = $1`, [input.workerId]);
    const result = input.id
      ? await client.query(`UPDATE worker_media SET url = $3, alt_text_ar = $4, visibility = $5, is_primary = $6 WHERE id = $1 AND worker_id = $2 RETURNING id, worker_id AS "workerId", url, alt_text_ar AS "altTextAr", visibility, is_primary AS "isPrimary"`, [input.id, input.workerId, input.url, input.altTextAr ?? null, input.visibility ?? "PUBLIC", input.isPrimary ?? false])
      : await client.query(`INSERT INTO worker_media (id,worker_id,url,alt_text_ar,visibility,is_primary) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, worker_id AS "workerId", url, alt_text_ar AS "altTextAr", visibility, is_primary AS "isPrimary"`, [id(), input.workerId, input.url, input.altTextAr ?? null, input.visibility ?? "PUBLIC", input.isPrimary ?? false]);
    await client.query("COMMIT");
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteWorkerMedia(workerId: string, mediaId: string): Promise<boolean> {
  const client = await pool();
  return (await client.query(`DELETE FROM worker_media WHERE id = $1 AND worker_id = $2`, [mediaId, workerId])).rowCount === 1;
}

export async function writeAudit(input: { actorAdminId: string; action: string; entityType: string; entityId?: string; afterJson?: unknown }): Promise<void> {
  const client = await pool();
  await client.query(`INSERT INTO audit_logs (id,actor_admin_id,action,entity_type,entity_id,after_json) VALUES ($1,$2,$3,$4,$5,$6::jsonb)`, [id(), input.actorAdminId, input.action, input.entityType, input.entityId ?? null, JSON.stringify(input.afterJson ?? null)]);
}
