import type { Card, Quiz, Node, Region, ReviewStatus } from '@/lib/types';
import type { CategoryDef } from './categories';
import type { AdminState } from './store';

export type AdminAction =
  // Cards
  | { type: 'UPSERT_CARD'; card: Card }
  | { type: 'DELETE_CARDS'; ids: string[] }
  | { type: 'BULK_STATUS'; ids: string[]; status: ReviewStatus }
  // Quizzes
  | { type: 'UPSERT_QUIZ'; quiz: Quiz }
  | { type: 'DELETE_QUIZ'; id: string }
  // Nodes
  | { type: 'UPSERT_NODE'; node: Node }
  | { type: 'DELETE_NODE'; id: string }
  | { type: 'MOVE_NODE'; id: string; newParentId: string | null; newSortOrder: number }
  // Master data
  | { type: 'UPSERT_REGION'; region: Region }
  | { type: 'DELETE_REGION'; id: string }
  | { type: 'UPSERT_CATEGORY'; category: CategoryDef }
  | { type: 'DELETE_CATEGORY'; value: string }
  // Import
  | { type: 'LOAD_STATE'; data: Omit<AdminState, 'isDirty' | 'lastSavedAt' | 'undoStack'> }
  | { type: 'MERGE_STATE'; data: Partial<Omit<AdminState, 'isDirty' | 'lastSavedAt' | 'undoStack'>> }
  // Persistence
  | { type: 'MARK_SAVED'; at: string }
  | { type: 'UNDO' };
