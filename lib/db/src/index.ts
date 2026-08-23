import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;
export const db = pool ? drizzle(pool, { schema }) : null;

export function requirePool(): pg.Pool {
  if (!pool) throw new Error("DATABASE_URL is required for catalogue operations");
  return pool;
}

export * from "./schema";
