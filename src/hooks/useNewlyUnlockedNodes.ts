'use client';

import { useEffect, useState } from 'react';
import { takePendingReveals } from '@/lib/strata';

const EMPTY: ReadonlySet<string> = new Set();

interface RevealState {
  regionId: string;
  ids: ReadonlySet<string>;
}

/**
 * この地域で「まだ演出を見せていない解放済みノード」を取り出す。
 *
 * 記録の取り出しは消費（= 副作用）なので effect で行い、
 * 結果は state に持つ。レンダー中には何も書き込まない。
 */
export function useNewlyUnlockedNodes(regionId: string): ReadonlySet<string> {
  const [reveal, setReveal] = useState<RevealState | null>(null);

  useEffect(() => {
    const ids = takePendingReveals(regionId);
    if (ids.length === 0) return;
    // 外部システム（localStorage）から 1 度だけ取り出した値を画面に反映する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal({ regionId, ids: new Set(ids) });
  }, [regionId]);

  // 別の地域に切り替えたら前の地域の演出は持ち越さない
  return reveal && reveal.regionId === regionId ? reveal.ids : EMPTY;
}
