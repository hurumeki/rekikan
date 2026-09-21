import type { EraColor } from './types';

/**
 * 地層メタファ（docs/09 §9.1.2）のための補助。
 *
 * ノードは時代帯を直接持たないが、兄弟ノードは時系列順（sort_order）に
 * 並んでいるため、その並び順を地域の時代帯カラーへ写像すると
 * 「上が古い層、下が新しい層」という断面図になる。
 */
export function stratumColor(
  index: number,
  siblingCount: number,
  eraColors: Record<string, EraColor>,
): string | null {
  const colors = Object.values(eraColors).map((e) => e.color);
  if (colors.length === 0) return null;
  if (siblingCount <= 1) return colors[0]!;

  const ratio = index / (siblingCount - 1);
  const mapped = Math.round(ratio * (colors.length - 1));
  return colors[Math.min(colors.length - 1, Math.max(0, mapped))]!;
}

const STORAGE_KEY = 'rekikan_seen_unlocked_nodes';

function readSeen(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const result: Record<string, string[]> = {};
    for (const [region, ids] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(ids))
        result[region] = ids.filter((id): id is string => typeof id === 'string');
    }
    return result;
  } catch {
    return {};
  }
}

function writeSeen(seen: Record<string, string[]>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // 保存できなくても演出が出ないだけなので黙って続ける
  }
}

/**
 * 前回この地域を開いたとき以降に解放されたノードを返し、記録を更新する。
 * 「地層が開く」演出を 1 度だけ出すために使う。
 *
 * 初回訪問（記録がまったくない）は演出なし。最初から解放されている
 * ノードまで一斉に光ってしまうため。
 */
export function takeNewlyUnlockedNodeIds(regionId: string, unlockedIds: string[]): string[] {
  const seen = readSeen();
  const previous = seen[regionId];
  seen[regionId] = [...unlockedIds];
  writeSeen(seen);

  if (!previous) return [];
  const previousSet = new Set(previous);
  return unlockedIds.filter((id) => !previousSet.has(id));
}
