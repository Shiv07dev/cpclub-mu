/**
 * MySQL Array Helpers
 *
 * MySQL has no native array type. We store arrays as JSON strings in TEXT columns.
 * These helpers serialize/deserialize them transparently.
 *
 * Pattern:
 *   DB column: rulesJson TEXT  (stores: '["Rule 1","Rule 2"]')
 *   API/service layer works with plain string[] arrays
 */

/** Serialize a string array to a JSON string for MySQL storage */
export function toJson(arr: string[] | undefined | null): string {
  if (!arr || !Array.isArray(arr)) return "[]";
  return JSON.stringify(arr);
}

/** Deserialize a JSON string from MySQL back to a string array */
export function fromJson(json: string | undefined | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Deserialize an object JSON field (for customResponses, socialLinks, etc.) */
export function fromJsonObj(json: string | undefined | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Convert a raw Prisma Event row (with *Json fields) to a clean API-shape event */
export function deserializeEvent(e: Record<string, unknown>): Record<string, unknown> {
  return {
    ...e,
    rules: fromJson(e["rulesJson"] as string),
    takeaways: fromJson(e["takeawaysJson"] as string),
    overview: fromJson(e["overviewJson"] as string),
    outcomes: fromJson(e["outcomesJson"] as string),
    agenda: fromJson(e["agendaJson"] as string),
    prerequisites: fromJson(e["prerequisitesJson"] as string),
    customFields: fromJson(e["customFieldsJson"] as string),
    // Remove raw JSON fields from output
    rulesJson: undefined,
    takeawaysJson: undefined,
    overviewJson: undefined,
    outcomesJson: undefined,
    agendaJson: undefined,
    prerequisitesJson: undefined,
    customFieldsJson: undefined,
  };
}

/** Convert a raw Prisma Registration row to clean API shape */
export function deserializeRegistration(r: Record<string, unknown>): Record<string, unknown> {
  return {
    ...r,
    teamMembers: fromJson(r["teamMembersJson"] as string),
    customResponses: fromJsonObj(r["customResponsesJson"] as string),
    teamMembersJson: undefined,
    customResponsesJson: undefined,
  };
}

/** Convert a raw Prisma Contest row to clean API shape */
export function deserializeContest(c: Record<string, unknown>): Record<string, unknown> {
  return {
    ...c,
    rules: fromJson(c["rulesJson"] as string),
    prizes: fromJson(c["prizesJson"] as string),
    rulesJson: undefined,
    prizesJson: undefined,
  };
}

/** Convert a raw Prisma CommitteeMember row to clean API shape */
export function deserializeCommitteeMember(m: Record<string, unknown>): Record<string, unknown> {
  return {
    ...m,
    socialLinks: fromJsonObj(m["socialLinksJson"] as string),
    socialLinksJson: undefined,
  };
}

/** Convert a raw AuditLog row to clean API shape */
export function deserializeAuditLog(log: Record<string, unknown>): Record<string, unknown> {
  return {
    ...log,
    details: fromJsonObj(log["detailsJson"] as string),
    detailsJson: undefined,
  };
}
