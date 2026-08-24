import type { MatchingRequest, WorkerRequestForm } from "@workspace/api-zod";

export type ApiWorker = {
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

export type AdminWorker = {
  id: string; public_code: string; display_name: string; slug: string; nationality_id: string;
  nationality_name_ar: string; age: number | null; current_city: string | null; years_experience: number | null;
  saudi_experience_years: number | null; public_summary_ar: string | null; public_summary_en: string | null;
  languages: string[]; availability_status: string; publication_status: string; is_featured: boolean; sort_order: number;
  skill_ids: string[]; media: Array<{ id: string; url: string; altTextAr: string | null; visibility: string; isPrimary: boolean }>;
};
export type TaxonomyItem = { id: string; nameAr: string; nameEn: string; slug: string; isActive: boolean; sortOrder: number };
export type AdminWorkerInput = {
  publicCode?: string; displayName: string; nationalityId: string; nationalityName?: string; age?: number | null; currentCity: string | null;
  yearsExperience: number | null; saudiExperienceYears: number | null; publicSummaryAr: string | null;
  languages: string[]; skillIds: string[]; isFeatured: boolean; sortOrder: number;
};

type ApiEnvelope<T> = { data: T };
const apiBase = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    let response: Response;
    try {
      response = await fetch(`${apiBase}${path}`, { credentials: "include", ...init, signal: init?.signal || controller.signal, headers: { "content-type": "application/json", accept: "application/json", ...(init?.headers || {}) } });
    } catch {
      throw new Error("تعذر الاتصال بالخادم.");
    }
    if (response.status === 204) return undefined as T;
    const body = await response.json().catch(() => null) as (ApiEnvelope<T> & { message?: string }) | null;
    if (!response.ok) throw new Error(body?.message || "تعذر الاتصال بالخادم.");
    if (!body || typeof body !== "object" || !("data" in body)) throw new Error("استجابة غير متوقعة من الخادم.");
    return body.data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getWorkers(params: { q?: string; skill?: string; nationality?: string; availability?: string } = {}): Promise<ApiWorker[]> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return apiFetch<ApiWorker[]>(`/workers${query.size ? `?${query.toString()}` : ""}`);
}

export function getWorker(slug: string): Promise<ApiWorker> { return apiFetch<ApiWorker>(`/workers/${encodeURIComponent(slug)}`); }
export function getPublicSettings(): Promise<{ whatsappNumber?: string; phoneNumber?: string }> { return apiFetch(`/public-settings`); }
export function getContent<T extends Record<string, unknown>>(key: string): Promise<{ key: string; contentAr: T; contentEn?: Record<string, unknown>; isActive: boolean }> { return apiFetch(`/content/${encodeURIComponent(key)}`); }
export function getNationalities(): Promise<Array<{ id: string; nameAr: string; nameEn: string; slug: string }>> { return apiFetch(`/nationalities`); }
export function getSkills(): Promise<Array<{ id: string; nameAr: string; nameEn: string; slug: string }>> { return apiFetch(`/skills`); }

export const adminApi = {
  login: (email: string, password: string) => apiFetch<{ id: string; email: string; displayName: string; role: string }>("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch<null>("/admin/auth/logout", { method: "POST" }),
  session: () => apiFetch<{ id: string; email: string; displayName: string; role: string }>("/admin/auth/session"),
  workers: () => apiFetch<AdminWorker[]>("/admin/workers"),
  createWorker: (input: AdminWorkerInput) => apiFetch<AdminWorker>("/admin/workers", { method: "POST", body: JSON.stringify(input) }),
  updateWorker: (id: string, input: AdminWorkerInput) => apiFetch<AdminWorker>(`/admin/workers/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  publish: (id: string) => apiFetch<Record<string, unknown>>(`/admin/workers/${id}/publish`, { method: "POST" }),
  unpublish: (id: string) => apiFetch<Record<string, unknown>>(`/admin/workers/${id}/unpublish`, { method: "POST" }),
  archive: (id: string) => apiFetch<Record<string, unknown>>(`/admin/workers/${id}/archive`, { method: "POST" }),
  availability: (id: string, status: string) => apiFetch<Record<string, unknown>>(`/admin/workers/${id}/availability`, { method: "PATCH", body: JSON.stringify({ status }) }),
  nationalities: () => apiFetch<TaxonomyItem[]>("/admin/nationalities"),
  skills: () => apiFetch<TaxonomyItem[]>("/admin/skills"),
  saveNationality: (input: Record<string, unknown>) => apiFetch<TaxonomyItem>("/admin/nationalities", { method: "POST", body: JSON.stringify(input) }),
  updateNationality: (id: string, input: Record<string, unknown>) => apiFetch<TaxonomyItem>(`/admin/nationalities/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  saveSkill: (input: Record<string, unknown>) => apiFetch<TaxonomyItem>("/admin/skills", { method: "POST", body: JSON.stringify(input) }),
  updateSkill: (id: string, input: Record<string, unknown>) => apiFetch<TaxonomyItem>(`/admin/skills/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  getSetting: (key: string) => apiFetch<{ key: string; value: string }>(`/admin/settings/${key}`),
  saveSetting: (key: string, value: string) => apiFetch<Record<string, unknown>>(`/admin/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) }),
  getContent: (key: string) => apiFetch<{ key: string; contentAr?: unknown; contentEn?: unknown; isActive: boolean }>(`/admin/content/${key}`),
  saveContent: (key: string, input: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/admin/content/${key}`, { method: "PATCH", body: JSON.stringify(input) }),
  saveMedia: (workerId: string, input: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/admin/workers/${workerId}/media`, { method: "POST", body: JSON.stringify(input) }),
  updateMedia: (workerId: string, mediaId: string, input: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/admin/workers/${workerId}/media/${mediaId}`, { method: "PATCH", body: JSON.stringify(input) }),
  uploadMedia: async (workerId: string, file: File): Promise<{ url: string; storageKey?: string; mimeType: string; sizeBytes: number }> => {
    const target = await apiFetch<{ upload: { url: string; fields: Record<string, string> }; publicUrl: string; maxBytes: number }>(`/admin/workers/${workerId}/media/upload`, { method: "POST", body: JSON.stringify({ contentType: file.type, size: file.size }) });
    const body = new FormData();
    for (const [key, value] of Object.entries(target.upload.fields)) body.append(key, value);
    body.append("file", file);
    const response = await fetch(target.upload.url, { method: "POST", body, credentials: "include", headers: { accept: "application/json" } });
    const uploaded = await response.json().catch(() => null) as { data?: { publicUrl?: string; storageKey?: string } } | null;
    if (!response.ok) throw new Error(uploaded?.data?.publicUrl || "تعذر رفع الوسيط إلى مخزن الملفات.");
    if (!uploaded?.data?.publicUrl) throw new Error("Invalid API response");
    return { url: uploaded.data.publicUrl, storageKey: uploaded.data.storageKey, mimeType: file.type, sizeBytes: file.size };
  },
  deleteMedia: (workerId: string, mediaId: string) => apiFetch<null>(`/admin/workers/${workerId}/media/${mediaId}`, { method: "DELETE" }),
};

export type { MatchingRequest, WorkerRequestForm };
