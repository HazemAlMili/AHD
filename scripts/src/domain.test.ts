import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMatchingRequestMessage,
  buildWhatsAppUrl,
  buildWorkerRequestMessage,
  isWorkerRequestable,
  matchingRequestSchema,
  workerRequestFormSchema,
} from "@workspace/api-zod";

test("only published and available workers are requestable", () => {
  assert.equal(isWorkerRequestable("PUBLISHED", "AVAILABLE"), true);
  assert.equal(isWorkerRequestable("DRAFT", "AVAILABLE"), false);
  assert.equal(isWorkerRequestable("ARCHIVED", "AVAILABLE"), false);
  assert.equal(isWorkerRequestable("PUBLISHED", "RESERVED"), false);
});

test("specific-worker form validates the approved fields", () => {
  assert.equal(workerRequestFormSchema.safeParse({ name: "سارة", city: "الرياض", phone: "0500000000" }).success, true);
  assert.equal(workerRequestFormSchema.safeParse({ name: "سارة", city: "", phone: "not-a-phone" }).success, false);
});

test("specific-worker message is deterministic and carries the trusted AHD reference", () => {
  const message = buildWorkerRequestMessage({
    workerPublicCode: "AHD-1024",
    workerDisplayName: "اسم لا يلزم العميل إدخاله",
    name: "سارة",
    city: "الرياض",
    phone: "+966 50 000 0000",
    note: "أفضل التواصل مساءً & بعد السادسة",
  });
  assert.match(message, /AHD-1024/);
  assert.match(message, /سارة/);
  assert.match(message, /مساءً & بعد السادسة/);
  assert.equal(message.includes("undefined"), false);
});

test("matching schema rejects incomplete consent and validates canonical fields", () => {
  const input = {
    city: "جدة", urgency: "خلال شهر", needs: ["رعاية الأطفال"], languagePreference: "العربية",
    saudiExperiencePreference: "مهمة", nationalityPreference: "", readiness: "خلال شهر",
    name: "ريم", phone: "0555555555", consent: true,
  } as { city: string; urgency: string; needs: string[]; languagePreference: string; saudiExperiencePreference: string; nationalityPreference: string; readiness: string; name: string; phone: string; consent: true };
  assert.equal(matchingRequestSchema.safeParse(input).success, true);
  assert.equal(matchingRequestSchema.safeParse({ ...input, consent: false }).success, false);
  assert.match(buildMatchingRequestMessage(input), /رعاية الأطفال/);
});

test("WhatsApp URL normalizes only the trusted destination and safely encodes Arabic", () => {
  const url = buildWhatsAppUrl("+966 55 123 4567", "السلام عليكم & أهلاً");
  assert.equal(url.startsWith("https://wa.me/966551234567?text="), true);
  assert.equal(decodeURIComponent(new URL(url).searchParams.get("text") || ""), "السلام عليكم & أهلاً");
  assert.throws(() => buildWhatsAppUrl("123", "message"), /valid WhatsApp destination/);
});
