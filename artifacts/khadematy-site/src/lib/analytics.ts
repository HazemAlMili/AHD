export type AnalyticsEvent =
  | "worker_listing_viewed"
  | "worker_profile_viewed"
  | "worker_request_started"
  | "worker_whatsapp_clicked"
  | "transfer_lp_viewed"
  | "matching_cta_clicked"
  | "matching_form_started"
  | "matching_step_1_completed"
  | "matching_step_2_completed"
  | "matching_whatsapp_clicked"
  | "phone_clicked";

export function trackEvent(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}): void {
  const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key]) => !/(name|phone|note|message|email)/i.test(key)));
  window.dispatchEvent(new CustomEvent("ahd:analytics", { detail: { event, properties: safeProperties } }));
  if (import.meta.env.DEV) console.debug(`[analytics] ${event}`, safeProperties);
}
