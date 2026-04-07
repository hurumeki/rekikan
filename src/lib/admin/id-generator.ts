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
 * Auto-generates a card ID from its fields.
 * Format: {region}_{era_band_short}_{name_slug}
 */
export function generateCardId(region: string, eraColorKey: string, name: string): string {
  const regionPart = region.slice(0, 6);
  const eraPart = eraColorKey.split('_').map((w) => w[0]).join('').slice(0, 4);
  const namePart = toRomaji(name).slice(0, 16) || 'card';
  const base = `${regionPart}_${eraPart}_${namePart}`;
  return base.replace(/_{2,}/g, '_').replace(/^_|_$/g, '');
}

/**
 * Generates a unique node ID.
 */
export function generateNodeId(region: string, label: string): string {
  const regionPart = region.slice(0, 6);
  const labelPart = toRomaji(label).slice(0, 16) || 'node';
  return `node_${regionPart}_${labelPart}`.replace(/_{2,}/g, '_');
}

/**
 * Generates a unique quiz ID.
 */
export function generateQuizId(region: string, title: string): string {
  const regionPart = region.slice(0, 6);
  const titlePart = toRomaji(title).slice(0, 16) || 'quiz';
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
