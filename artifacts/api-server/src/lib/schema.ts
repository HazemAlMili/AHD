import { requirePool } from "@workspace/db";

let initialized = false;

export async function ensureSchema(): Promise<void> {
  if (initialized) return;
  const pool = requirePool();
  await pool.query(`
    DO $$ BEGIN CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN','ADMIN','OPERATIONS','CONTENT_MANAGER','ANALYST'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE worker_availability_status AS ENUM ('AVAILABLE','ON_HOLD','RESERVED','TRANSFER_IN_PROGRESS','TRANSFERRED','UNAVAILABLE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE publication_status AS ENUM ('DRAFT','PUBLISHED','ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE media_visibility AS ENUM ('PUBLIC','INTERNAL','SENSITIVE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE TABLE IF NOT EXISTS admin_users (
      id text PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL,
      display_name text NOT NULL, role admin_role NOT NULL DEFAULT 'ADMIN', is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash text PRIMARY KEY, admin_user_id text NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS nationalities (
      id text PRIMARY KEY, name_en text NOT NULL, name_ar text NOT NULL, slug text NOT NULL UNIQUE,
      is_active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS skills (
      id text PRIMARY KEY, name_en text NOT NULL, name_ar text NOT NULL, slug text NOT NULL UNIQUE,
      is_active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS workers (
      id text PRIMARY KEY, public_code text NOT NULL UNIQUE, display_name text NOT NULL, slug text NOT NULL UNIQUE,
      nationality_id text NOT NULL REFERENCES nationalities(id), age integer, current_city text,
      years_experience integer, saudi_experience_years integer, public_summary_en text, public_summary_ar text,
      languages text[] NOT NULL DEFAULT '{}', internal_notes text,
      availability_status worker_availability_status NOT NULL DEFAULT 'AVAILABLE',
      publication_status publication_status NOT NULL DEFAULT 'DRAFT', is_featured boolean NOT NULL DEFAULT false,
      sort_order integer NOT NULL DEFAULT 0, published_at timestamptz, archived_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS worker_skills (
      worker_id text NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
      skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(worker_id, skill_id)
    );
    CREATE TABLE IF NOT EXISTS worker_media (
      id text PRIMARY KEY, worker_id text NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
      url text NOT NULL, storage_key text, mime_type text, size_bytes integer,
      visibility media_visibility NOT NULL DEFAULT 'PUBLIC', is_primary boolean NOT NULL DEFAULT false,
      alt_text_ar text, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS content_blocks (
      id text PRIMARY KEY, key text NOT NULL UNIQUE, content_en jsonb, content_ar jsonb,
      is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS system_settings (
      id text PRIMARY KEY, key text NOT NULL UNIQUE, value jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id text PRIMARY KEY, actor_admin_id text REFERENCES admin_users(id), action text NOT NULL,
      entity_type text NOT NULL, entity_id text, before_json jsonb, after_json jsonb,
      request_id text, ip_address text, user_agent text, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS workers_public_filter_idx ON workers(publication_status, availability_status, is_featured, sort_order);
    CREATE INDEX IF NOT EXISTS workers_nationality_idx ON workers(nationality_id);
    CREATE INDEX IF NOT EXISTS worker_skills_skill_idx ON worker_skills(skill_id, worker_id);
    CREATE INDEX IF NOT EXISTS worker_media_worker_idx ON worker_media(worker_id, is_primary);
    CREATE INDEX IF NOT EXISTS admin_sessions_admin_idx ON admin_sessions(admin_user_id);
    CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs(actor_admin_id, created_at DESC);
  `);
  initialized = true;
}
