'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { Region, Card, Quiz, Node } from '@/lib/types';
import type { CategoryDef } from './categories';
import type { AdminAction } from './actions';
import { loadAdminState, saveAdminState } from './indexeddb';
import { buildInitialAdminState } from './initial-data';

export interface AdminState {
  regions: Region[];
  cards: Card[];
  quizzes: Quiz[];
  nodes: Node[];
  categories: CategoryDef[];
  isDirty: boolean;
  lastSavedAt: string | null;
  undoStack: Omit<AdminState, 'undoStack'> | null;
}

const emptyState: AdminState = {
  regions: [],
  cards: [],
  quizzes: [],
  nodes: [],
  categories: [],
  isDirty: false,
  lastSavedAt: null,
  undoStack: null,
};

function withUndo(prev: AdminState): Pick<AdminState, 'undoStack'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { undoStack: _u, ...snapshot } = prev;
  return { undoStack: snapshot };
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'UPSERT_CARD': {
      const exists = state.cards.some((c) => c.id === action.card.id);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        cards: exists
          ? state.cards.map((c) => (c.id === action.card.id ? action.card : c))
          : [...state.cards, action.card],
      };
    }
    case 'DELETE_CARDS': {
      const ids = new Set(action.ids);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        cards: state.cards.filter((c) => !ids.has(c.id)),
        // Also remove from quizzes
        quizzes: state.quizzes.map((q) => ({
          ...q,
          card_ids: q.card_ids.filter((id) => !ids.has(id)),
        })),
      };
    }
    case 'BULK_STATUS': {
      const ids = new Set(action.ids);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        cards: state.cards.map((c) =>
          ids.has(c.id) ? { ...c, status: action.status } : c
        ),
      };
    }
    case 'UPSERT_QUIZ': {
      const exists = state.quizzes.some((q) => q.id === action.quiz.id);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        quizzes: exists
          ? state.quizzes.map((q) => (q.id === action.quiz.id ? action.quiz : q))
          : [...state.quizzes, action.quiz],
      };
    }
    case 'DELETE_QUIZ': {
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        quizzes: state.quizzes.filter((q) => q.id !== action.id),
        nodes: state.nodes.map((n) => ({
          ...n,
          quiz_ids: n.quiz_ids.filter((id) => id !== action.id),
        })),
      };
    }
    case 'UPSERT_NODE': {
      const exists = state.nodes.some((n) => n.id === action.node.id);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        nodes: exists
          ? state.nodes.map((n) => (n.id === action.node.id ? action.node : n))
          : [...state.nodes, action.node],
      };
    }
    case 'DELETE_NODE': {
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        nodes: state.nodes.filter((n) => n.id !== action.id),
      };
    }
    case 'MOVE_NODE': {
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        nodes: state.nodes.map((n) =>
          n.id === action.id
            ? { ...n, parent_id: action.newParentId, sort_order: action.newSortOrder }
            : n
        ),
      };
    }
    case 'UPSERT_REGION': {
      const exists = state.regions.some((r) => r.id === action.region.id);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        regions: exists
          ? state.regions.map((r) => (r.id === action.region.id ? action.region : r))
          : [...state.regions, action.region],
      };
    }
    case 'DELETE_REGION': {
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        regions: state.regions.filter((r) => r.id !== action.id),
      };
    }
    case 'UPSERT_CATEGORY': {
      const exists = state.categories.some((c) => c.value === action.category.value);
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        categories: exists
          ? state.categories.map((c) =>
              c.value === action.category.value ? action.category : c
            )
          : [...state.categories, action.category],
      };
    }
    case 'DELETE_CATEGORY': {
      return {
        ...state,
        ...withUndo(state),
        isDirty: true,
        categories: state.categories.filter((c) => c.value !== action.value),
      };
    }
    case 'LOAD_STATE': {
      return {
        ...emptyState,
        ...action.data,
        isDirty: true,
        lastSavedAt: null,
        undoStack: null,
      };
    }
    case 'MERGE_STATE': {
      const merged = { ...state };
      if (action.data.cards) {
        const idSet = new Map(action.data.cards.map((c) => [c.id, c]));
        const existing = state.cards.filter((c) => !idSet.has(c.id));
        merged.cards = [...existing, ...action.data.cards];
      }
      if (action.data.quizzes) {
        const idSet = new Map(action.data.quizzes.map((q) => [q.id, q]));
        const existing = state.quizzes.filter((q) => !idSet.has(q.id));
        merged.quizzes = [...existing, ...action.data.quizzes];
      }
      if (action.data.nodes) {
        const idSet = new Map(action.data.nodes.map((n) => [n.id, n]));
        const existing = state.nodes.filter((n) => !idSet.has(n.id));
        merged.nodes = [...existing, ...action.data.nodes];
      }
      if (action.data.regions) {
        const idSet = new Map(action.data.regions.map((r) => [r.id, r]));
        const existing = state.regions.filter((r) => !idSet.has(r.id));
        merged.regions = [...existing, ...action.data.regions];
      }
      if (action.data.categories) {
        merged.categories = action.data.categories;
      }
      return { ...merged, ...withUndo(state), isDirty: true };
    }
    case 'MARK_SAVED': {
      return { ...state, isDirty: false, lastSavedAt: action.at };
    }
    case 'UNDO': {
      if (!state.undoStack) return state;
      return { ...state.undoStack, isDirty: true, undoStack: null };
    }
    default:
      return state;
  }
}

interface AdminContextValue {
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, emptyState);
  const hydrated = useRef(false);
  // Always holds the latest state for use in async callbacks (avoids stale closure)
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Hydrate from IndexedDB or JSON on first mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    (async () => {
      const saved = await loadAdminState();
      if (saved) {
        dispatch({ type: 'LOAD_STATE', data: saved });
        dispatch({ type: 'MARK_SAVED', at: saved.lastSavedAt ?? new Date().toISOString() });
      } else {
        const initial = buildInitialAdminState();
        dispatch({ type: 'LOAD_STATE', data: initial });
        dispatch({ type: 'MARK_SAVED', at: new Date().toISOString() });
      }
    })();
  }, []);

  // Auto-save with debounce — uses stateRef to save the latest state at callback time
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state.isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      // Read from ref so we always persist the most recent state, not the
      // captured closure value from when the timer was scheduled.
      await saveAdminState(stateRef.current);
      dispatch({ type: 'MARK_SAVED', at: new Date().toISOString() });
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.isDirty]);

  return <AdminContext.Provider value={{ state, dispatch }}>{children}</AdminContext.Provider>;
}

export function useAdminStore(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminStore must be used within AdminStoreProvider');
  return ctx;
}
