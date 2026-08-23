import {
  boolean,
  integer,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATIONS",
  "CONTENT_MANAGER",
  "ANALYST",
]);

export const workerAvailabilityStatus = pgEnum("worker_availability_status", [
  "AVAILABLE",
  "ON_HOLD",
  "RESERVED",
  "TRANSFER_IN_PROGRESS",
  "TRANSFERRED",
  "UNAVAILABLE",
]);

export const publicationStatus = pgEnum("publication_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const mediaVisibility = pgEnum("media_visibility", ["PUBLIC", "INTERNAL", "SENSITIVE"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: adminRole("role").notNull().default("ADMIN"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}, (table) => ({ emailIndex: uniqueIndex("admin_users_email_idx").on(table.email) }));

export const adminSessions = pgTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  adminUserId: text("admin_user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ adminIndex: index("admin_sessions_admin_idx").on(table.adminUserId) }));

export const nationalities = pgTable("nationalities", {
  id: text("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => ({ slugIndex: uniqueIndex("nationalities_slug_idx").on(table.slug) }));

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => ({ slugIndex: uniqueIndex("skills_slug_idx").on(table.slug) }));

export const workers = pgTable("workers", {
  id: text("id").primaryKey(),
  publicCode: text("public_code").notNull(),
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull(),
  nationalityId: text("nationality_id").notNull().references(() => nationalities.id),
  age: integer("age"),
  currentCity: text("current_city"),
  yearsExperience: integer("years_experience"),
  saudiExperienceYears: integer("saudi_experience_years"),
  publicSummaryEn: text("public_summary_en"),
  publicSummaryAr: text("public_summary_ar"),
  languages: text("languages").array().notNull().default([]),
  internalNotes: text("internal_notes"),
  availabilityStatus: workerAvailabilityStatus("availability_status").notNull().default("AVAILABLE"),
  publicationStatus: publicationStatus("publication_status").notNull().default("DRAFT"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  publicCodeIndex: uniqueIndex("workers_public_code_idx").on(table.publicCode),
  slugIndex: uniqueIndex("workers_slug_idx").on(table.slug),
  nationalityIndex: index("workers_nationality_idx").on(table.nationalityId),
  publicFilterIndex: index("workers_public_filter_idx").on(table.publicationStatus, table.availabilityStatus, table.isFeatured, table.sortOrder),
}));

export const workerSkills = pgTable("worker_skills", {
  workerId: text("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ pk: primaryKey({ columns: [table.workerId, table.skillId] }) }));

export const workerMedia = pgTable("worker_media", {
  id: text("id").primaryKey(),
  workerId: text("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  storageKey: text("storage_key"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  visibility: mediaVisibility("visibility").notNull().default("PUBLIC"),
  isPrimary: boolean("is_primary").notNull().default(false),
  altTextAr: text("alt_text_ar"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ workerIndex: index("worker_media_worker_idx").on(table.workerId, table.isPrimary) }));

export const contentBlocks = pgTable("content_blocks", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  contentEn: jsonb("content_en"),
  contentAr: jsonb("content_ar"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}, (table) => ({ keyIndex: uniqueIndex("content_blocks_key_idx").on(table.key) }));

export const systemSettings = pgTable("system_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  ...timestamps,
}, (table) => ({ keyIndex: uniqueIndex("system_settings_key_idx").on(table.key) }));

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorAdminId: text("actor_admin_id").references(() => adminUsers.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  beforeJson: jsonb("before_json"),
  afterJson: jsonb("after_json"),
  requestId: text("request_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ actorIndex: index("audit_logs_actor_idx").on(table.actorAdminId, table.createdAt) }));

export type AdminUser = typeof adminUsers.$inferSelect;
export type Nationality = typeof nationalities.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Worker = typeof workers.$inferSelect;
export type WorkerMedia = typeof workerMedia.$inferSelect;
