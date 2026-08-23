import { z } from "zod";

export const workerAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "ON_HOLD",
  "RESERVED",
  "TRANSFER_IN_PROGRESS",
  "TRANSFERRED",
  "UNAVAILABLE",
]);

export const publicationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const adminRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "OPERATIONS", "CONTENT_MANAGER", "ANALYST"]);

export type WorkerAvailabilityStatus = z.infer<typeof workerAvailabilityStatusSchema>;
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export type AdminRole = z.infer<typeof adminRoleSchema>;

export function isWorkerRequestable(publicationStatus: PublicationStatus, availabilityStatus: WorkerAvailabilityStatus): boolean {
  return publicationStatus === "PUBLISHED" && availabilityStatus === "AVAILABLE";
}

export function canAdminRole(currentRole: string | undefined, allowedRoles: readonly string[]): boolean {
  return Boolean(currentRole) && (allowedRoles.length === 0 || allowedRoles.includes(currentRole!));
}

export const workerRequestFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9٠-٩+\s-]{8,20}$/),
  note: z.string().trim().max(1000).optional().default(""),
});

export const matchingStepOneSchema = z.object({
  city: z.string().trim().min(1).max(120),
  urgency: z.string().trim().min(1).max(120),
  needs: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
  languagePreference: z.string().trim().max(120).optional().default(""),
  saudiExperiencePreference: z.string().trim().max(120).optional().default(""),
});

export const matchingStepTwoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9٠-٩+\s-]{8,20}$/),
  nationalityPreference: z.string().trim().max(120).optional().default(""),
  readiness: z.string().trim().min(1).max(120),
  consent: z.literal(true),
});

export const matchingRequestSchema = matchingStepOneSchema.merge(matchingStepTwoSchema);

export type WorkerRequestForm = z.infer<typeof workerRequestFormSchema>;
export type MatchingRequest = z.infer<typeof matchingRequestSchema>;

function field(label: string, value: string | undefined): string {
  const safeValue = value?.trim();
  return safeValue ? `${label}: ${safeValue}` : "";
}

export function buildWorkerRequestMessage(input: {
  workerPublicCode: string;
  workerDisplayName?: string;
  name: string;
  city: string;
  phone: string;
  note?: string;
}): string {
  const parsed = workerRequestFormSchema.parse(input);
  return [
    "السلام عليكم،",
    `أرغب في الاستفسار عن العاملة رقم: ${input.workerPublicCode.trim()}`,
    field("الاسم", parsed.name),
    field("المدينة", parsed.city),
    field("رقم الجوال", parsed.phone),
    field("ملاحظة", parsed.note),
  ].filter(Boolean).join("\n");
}

export function buildMatchingRequestMessage(input: MatchingRequest): string {
  const parsed = matchingRequestSchema.parse(input);
  return [
    "السلام عليكم،",
    "أرغب في طلب مطابقة لعاملة منزلية.",
    field("المدينة", parsed.city),
    field("التوقيت", parsed.urgency),
    field("الاحتياج", parsed.needs.join("، ")),
    field("اللغة المفضلة", parsed.languagePreference),
    field("الخبرة السابقة في السعودية", parsed.saudiExperiencePreference),
    field("الجنسية المفضلة", parsed.nationalityPreference),
    field("الاستعداد", parsed.readiness),
    field("الاسم", parsed.name),
    field("رقم الجوال", parsed.phone),
  ].filter(Boolean).join("\n");
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const normalized = whatsappNumber.replace(/[^0-9]/g, "");
  if (!normalized || normalized.length < 8 || normalized.length > 15) {
    throw new Error("A valid WhatsApp destination is required");
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
