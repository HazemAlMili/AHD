export const availabilityStatuses = ["AVAILABLE", "ON_HOLD", "RESERVED", "TRANSFER_IN_PROGRESS", "TRANSFERRED", "UNAVAILABLE"] as const;

export const availabilityLabels: Record<string, string> = {
  AVAILABLE: "متاحة",
  ON_HOLD: "معلّقة",
  RESERVED: "محجوزة",
  TRANSFER_IN_PROGRESS: "نقل الخدمات جارٍ",
  TRANSFERRED: "تم نقل الخدمات",
  UNAVAILABLE: "غير متاحة",
};

export const publicationLabels: Record<string, string> = {
  DRAFT: "مسودة",
  PUBLISHED: "منشورة",
  ARCHIVED: "مؤرشفة",
};

export function availabilityLabel(status: string): string {
  return availabilityLabels[status] || "متاحة للتواصل";
}

export function publicationLabel(status: string): string {
  return publicationLabels[status] || status;
}
