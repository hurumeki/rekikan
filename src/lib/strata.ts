import type { EraColor } from './types';
import { createLocalStore } from './local-store';

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

export const PENDING_REVEALS_STORAGE_KEY = 'rekikan_pending_reveals';

type PendingRevealsMap = Record<string, string[]>;

/**
 * 「まだ演出を見せていない解放済みノード」を地域ごとに保持する。
 *
 * 以前は「前回見たときの解放状態」を記録して差分を取っていたが、
 * 進捗は localStorage から後追いで読み込まれるため、
 * 記録を作る時点で進捗が入っているかどうかが実行タイミング次第になり、
 * 演出が出たり出なかったりしていた。
 *
 * クイズを解いた瞬間なら「解く前」と「解いた後」の両方が分かるので、
 * そこで差分を確定して積んでおき、一覧を開いたときに取り出す。
 */
const pendingStore = createLocalStore<PendingRevealsMap>({
  key: PENDING_REVEALS_STORAGE_KEY,
  version: 1,
  empty: {},
  parse: (data) => {
    if (!data || typeof data !== 'object') return {};
    const result: PendingRevealsMap = {};
    for (const [region, ids] of Object.entries(data as Record<string, unknown>)) {
      if (Array.isArray(ids)) {
        result[region] = ids.filter((id): id is string => typeof id === 'string');
      }
    }
    return result;
  },
});

/** 解放されたノードを、演出待ちとして積む。 */
export function recordPendingReveals(nodeIdsByRegion: Record<string, string[]>): void {
  const entries = Object.entries(nodeIdsByRegion).filter(([, ids]) => ids.length > 0);
  if (entries.length === 0) return;

  pendingStore.update((current) => {
    const next = { ...current };
    for (const [regionId, ids] of entries) {
      const merged = new Set([...(next[regionId] ?? []), ...ids]);
      next[regionId] = [...merged];
    }
    return next;
  });
}

/** 演出待ちのノードを取り出し、記録から消す（1 度だけ出すため）。 */
export function takePendingReveals(regionId: string): string[] {
  const pending = pendingStore.read()[regionId] ?? [];
  if (pending.length === 0) return [];

  pendingStore.update((current) => {
    const next = { ...current };
    delete next[regionId];
    return next;
  });
  return pending;
}
