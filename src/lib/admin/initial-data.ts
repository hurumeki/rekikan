import type { AdminState } from './store';
import { CATEGORIES } from './categories';
import { REGIONS, ALL_QUIZZES, ALL_NODES } from '@/lib/data-registry';
import { loadAllCards } from '@/lib/data-loader';

/**
 * エディタは全カードを扱うので、初期状態の構築時にすべて読み込む。
 * （アプリ本体は地域単位の遅延読み込み）
 */
export async function buildInitialAdminState(): Promise<
  Omit<AdminState, 'isDirty' | 'lastSavedAt' | 'undoStack'>
> {
  return {
    regions: REGIONS,
    cards: await loadAllCards(),
    quizzes: ALL_QUIZZES,
    nodes: ALL_NODES,
    categories: CATEGORIES,
  };
}
