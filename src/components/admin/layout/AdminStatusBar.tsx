'use client';

import { useAdminStore } from '@/lib/admin/store';

export function AdminStatusBar() {
  const { state } = useAdminStore();

  const lastSaved = state.lastSavedAt
    ? new Date(state.lastSavedAt).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <footer className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-1 shrink-0 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>カード: {state.cards.length}</span>
        <span>クイズ: {state.quizzes.length}</span>
        <span>ノード: {state.nodes.length}</span>
      </div>
      <div className="flex items-center gap-2">
        {state.isDirty && (
          <span className="flex items-center gap-1 text-orange-500">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            未保存の変更あり
          </span>
        )}
        {lastSaved && !state.isDirty && <span>最終保存: {lastSaved}</span>}
      </div>
    </footer>
  );
}
