import type { AdminState } from './store';
import { CATEGORIES } from './categories';
import { REGIONS, ALL_CARDS, ALL_QUIZZES, ALL_NODES } from '@/lib/data-registry';

export function buildInitialAdminState(): Omit<
  AdminState,
  'isDirty' | 'lastSavedAt' | 'undoStack'
> {
  return {
    regions: REGIONS,
    cards: ALL_CARDS,
    quizzes: ALL_QUIZZES,
    nodes: ALL_NODES,
    categories: CATEGORIES,
  };
}
