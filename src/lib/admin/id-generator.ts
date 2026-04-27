/**
 * Simple romanization for Japanese text (handles common patterns).
 * Used for auto-generating card IDs.
 */
export function toRomaji(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII (Japanese chars)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .slice(0, 20);
}

/**
 * Stable short hash of an arbitrary string (e.g. Japanese-only names) so
 * generated IDs stay distinct and content-addressable instead of all
 * collapsing to "card_2", "card_3", ...
 */
function stableHash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(h, 31) + text.charCodeAt(i)) | 0;
  }
  // 6 char base36, unsigned
  return (h >>> 0).toString(36).padStart(6, '0').slice(-6);
}

function nameSlug(text: string, fallbackPrefix: string): string {
  const r = toRomaji(text);
  if (r) return r.slice(0, 16);
  if (text) return `${fallbackPrefix}${stableHash(text)}`;
  return fallbackPrefix;
}

/**
 * Auto-generates a card ID from its fields.
 * Format: {region}_{era_band_short}_{name_slug}
 */
export function generateCardId(region: string, eraColorKey: string, name: string): string {
  const regionPart = region.slice(0, 6);
  const eraPart = eraColorKey
    .split('_')
    .map((w) => w[0])
    .join('')
    .slice(0, 4);
  const namePart = nameSlug(name, 'card_');
  const base = `${regionPart}_${eraPart}_${namePart}`;
  return base.replace(/_{2,}/g, '_').replace(/^_|_$/g, '');
}

/**
 * Generates a unique node ID.
 */
export function generateNodeId(region: string, label: string): string {
  const regionPart = region.slice(0, 6);
  const labelPart = nameSlug(label, 'node_');
  return `node_${regionPart}_${labelPart}`.replace(/_{2,}/g, '_');
}

/**
 * Generates a unique quiz ID.
 */
export function generateQuizId(region: string, title: string): string {
  const regionPart = region.slice(0, 6);
  const titlePart = nameSlug(title, 'quiz_');
  return `quiz_${regionPart}_${titlePart}`.replace(/_{2,}/g, '_');
}

/**
 * Ensures uniqueness by appending a counter suffix if needed.
 */
export function ensureUnique(id: string, existingIds: Set<string>): string {
  if (!existingIds.has(id)) return id;
  let counter = 2;
  while (existingIds.has(`${id}_${counter}`)) counter++;
  return `${id}_${counter}`;
}
