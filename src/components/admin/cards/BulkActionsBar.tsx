'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin-ui/select';
import { useAdminStore } from '@/lib/admin/store';
import type { ReviewStatus } from '@/lib/types';

interface Props {
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedIds, onClearSelection }: Props) {
  const { dispatch } = useAdminStore();

  function handleBulkStatus(status: ReviewStatus) {
    dispatch({ type: 'BULK_STATUS', ids: [...selectedIds], status });
    onClearSelection();
  }

  function handleDelete() {
    if (!confirm(`${selectedIds.size}件のカードを削除しますか？`)) return;
    dispatch({ type: 'DELETE_CARDS', ids: [...selectedIds] });
    onClearSelection();
  }

  if (selectedIds.size === 0) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 border-b border-primary/20">
      <span className="text-sm font-medium text-primary">{selectedIds.size}件選択中</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">ステータス変更:</span>
        <Select onValueChange={(v) => handleBulkStatus(v as ReviewStatus)}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue placeholder="ステータス選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">下書き</SelectItem>
            <SelectItem value="ai_generated">AI生成</SelectItem>
            <SelectItem value="reviewed">レビュー済</SelectItem>
            <SelectItem value="approved">承認済</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="destructive" size="sm" onClick={handleDelete} className="h-7 text-xs">
        <Trash2 className="h-3 w-3 mr-1" />
        削除
      </Button>
      <button
        onClick={onClearSelection}
        className="text-xs text-muted-foreground hover:text-foreground underline ml-auto"
      >
        選択解除
      </button>
    </div>
  );
}
