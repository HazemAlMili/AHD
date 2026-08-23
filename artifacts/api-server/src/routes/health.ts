import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/readyz", async (_req, res) => {
  if (!pool) {
    res.status(503).json({ status: "not_ready", checks: { database: "not_configured" } });
    return;
  }
  try {
    await pool.query("SELECT 1");
    const migrationTable = await pool.query<{ migrations_table: string | null }>("SELECT to_regclass('public.schema_migrations') AS migrations_table");
    if (!migrationTable.rows[0]?.migrations_table) {
      res.status(503).json({ status: "not_ready", checks: { database: "migration_required" } });
      return;
    }
    const applied = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM schema_migrations");
    if (Number(applied.rows[0]?.count || 0) < 1) {
      res.status(503).json({ status: "not_ready", checks: { database: "migration_required" } });
      return;
    }
    res.json({ status: "ready", checks: { database: "ok" } });
  } catch {
    res.status(503).json({ status: "not_ready", checks: { database: "unavailable" } });
  }
});

export default router;
