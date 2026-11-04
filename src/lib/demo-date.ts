import type { DocumentSummary, PolicyStatus } from "@/types/api";

/**
 * Fixed demo reference date. All "is this policy in effect?" decisions use this
 * date instead of the real clock so the demo is reproducible.
 */
export const DEMO_TODAY = "2026-10-30";

/** Policy effective-state relative to the demo reference date (YYYY-MM-DD comparison). */
export function effectiveState(effectiveDate: string, today: string = DEMO_TODAY): "current" | "future" {
  return effectiveDate > today ? "future" : "current";
}

/**
 * Derive the policy status of a document version within its title group:
 * the newest version effective on/before the demo date is "current",
 * anything newer is "upcoming", anything older is "previous".
 */
export function policyStatusOf(doc: Pick<DocumentSummary, "title" | "version" | "effective_date">, all: Pick<DocumentSummary, "title" | "version" | "effective_date">[]): PolicyStatus {
  const versions = all.filter((d) => d.title === doc.title).sort((a, b) => a.effective_date.localeCompare(b.effective_date));
  const current = [...versions].reverse().find((d) => d.effective_date <= DEMO_TODAY);
  if (current && doc.version === current.version && doc.effective_date === current.effective_date) return "current";
  return doc.effective_date > DEMO_TODAY ? "upcoming" : "previous";
}
