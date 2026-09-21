'use client';

import { useEffect, useState } from 'react';
import { takeNewlyUnlockedNodeIds } from '@/lib/strata';

const EMPTY: ReadonlySet<string> = new Set();

interface RevealState {
  regionId: string;
  ids: ReadonlySet<string>;
}

/**
 * 前回その地域を見たとき以降に解放されたノードを返す。
 *
 * 「どこまで解放済みか」の記録は localStorage にあり、読むと同時に
 * 更新する必要がある（= 副作用）。レンダー中に書くと、React が
 * レンダーをやり直したり捨てたりしたときの挙動が保証されないため、
 * 書き込みは effect に置き、結果は state で保持する。
 */
export function useNewlyUnlockedNodes(
  regionId: string,
  unlockedNodeIds: string[],
): ReadonlySet<string> {
  const [reveal, setReveal] = useState<RevealState | null>(null);

  // 配列は毎レンダー新しくなるため、依存配列には内容から作ったキーを使う
  const unlockedKey = unlockedNodeIds.join('|');

  useEffect(() => {
    const ids = takeNewlyUnlockedNodeIds(regionId, unlockedKey ? unlockedKey.split('|') : []);
    if (ids.length === 0) return;
    // 外部システム（localStorage）から 1 度だけ取り出した値を画面に反映する。
    // レンダー中に副作用を起こさないための意図的な setState。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal({ regionId, ids: new Set(ids) });
  }, [regionId, unlockedKey]);

  // 別の地域に切り替えたら前の地域の演出は持ち越さない
  return reveal && reveal.regionId === regionId ? reveal.ids : EMPTY;
}
