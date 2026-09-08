/**
 * Team identity — two tiers.
 *
 * DISPLAY NAME   exactly as stored (accents, casing) — always used in the UI.
 * CANONICAL KEY  accent-stripped, lower-cased, whitespace-collapsed — used only
 *                as an internal Map key. No dictionary, no fuzzy matching.
 */
export function normalizeForMatch(value: string | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The computational key for a team. Never shown to the user. */
export function canon(name: string | null | undefined): string {
  return normalizeForMatch(name)
}

export function displayNameOf(
  aliases: Record<string, string> | undefined,
  key: string,
  fallback?: string | null
): string {
  return aliases?.[key] ?? fallback ?? key
}
