import { randomUUID } from "node:crypto";

export function id(): string {
  return randomUUID();
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

export function publicCode(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (/^AHD-[0-9]{4,}$/.test(normalized)) return normalized;
  const digits = normalized.replace(/\D/g, "").slice(-6).padStart(4, "0");
  return `AHD-${digits}`;
}
