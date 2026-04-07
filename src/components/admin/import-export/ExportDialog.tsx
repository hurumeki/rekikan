'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin-ui/dialog';
import { Button } from '@/components/admin-ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin-ui/select';
import { useAdminStore } from '@/lib/admin/store';
import { buildExport, downloadJson, type ExportScope } from '@/lib/admin/export';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: Props) {
  const { state } = useAdminStore();
  const [scope, setScope] = useState<ExportScope>('all');
  const [regionId, setRegionId] = useState('');

  function handleExport() {
    const data = buildExport(state, { scope, regionId: scope === 'by_region' ? regionId : undefined });
    const dateStr = new Date().toISOString().slice(0, 10);
    const scopeStr = scope === 'approved_only' ? '_approved' : scope === 'by_region' ? `_${regionId}` : '';
    downloadJson(data, `rekikan${scopeStr}_${dateStr}.json`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>エクスポート</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">エクスポート範囲</label>
            <div className="space-y-2">
              {(['all', 'approved_only', 'by_region'] as ExportScope[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value={s}
                    checked={scope === s}
                    onChange={() => setScope(s)}
                    className="accent-primary"
                  />
                  <span className="text-sm">
                    {s === 'all' && '全データ'}
                    {s === 'approved_only' && '承認済みのみ'}
                    {s === 'by_region' && 'リージョン別'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {scope === 'by_region' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">リージョン</label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger>
                  <SelectValue placeholder="リージョンを選択" />
                </SelectTrigger>
                <SelectContent>
                  {state.regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.emoji} {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <div>カード: {state.cards.length}枚</div>
            <div>クイズ: {state.quizzes.length}</div>
            <div>ノード: {state.nodes.length}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleExport} disabled={scope === 'by_region' && !regionId}>
            ダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
