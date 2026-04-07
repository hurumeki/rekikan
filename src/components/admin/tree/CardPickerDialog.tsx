'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin-ui/dialog';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin-ui/select';
import { Badge } from '@/components/admin-ui/badge';
import { useAdminStore } from '@/lib/admin/store';
import type { Card } from '@/lib/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds?: string[];
  onSelect: (cards: Card[]) => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  ai_generated: 'AI生成',
  reviewed: 'レビュー済',
  approved: '承認済',
};

export function CardPickerDialog({ open, onOpenChange, excludeIds = [], onSelect }: Props) {
  const { state } = useAdminStore();
  const [search, setSearch] = useState('');
  const [regionId, setRegionId] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const exclude = new Set(excludeIds);

  const filtered = useMemo(() => {
    return state.cards.filter((c) => {
      if (exclude.has(c.id)) return false;
      if (regionId && c.region !== regionId) return false;
      if (status && (c.status ?? 'draft') !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        const inName = c.name?.toLowerCase().includes(q) ?? false;
        const inDesc = c.description.toLowerCase().includes(q);
        if (!inName && !inDesc) return false;
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.cards, search, regionId, status, excludeIds]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const cards = state.cards.filter((c) => selected.has(c.id));
    onSelect(cards);
    setSelected(new Set());
    onOpenChange(false);
  }

  const regionMap = new Map(state.regions.map((r) => [r.id, r]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>カードを選択</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />
          <Select value={regionId || '__all__'} onValueChange={(v) => setRegionId(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="リージョン" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">すべて</SelectItem>
              {state.regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.emoji} {r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status || '__all__'} onValueChange={(v) => setStatus(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">すべて</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="ai_generated">AI生成</SelectItem>
              <SelectItem value="reviewed">レビュー済</SelectItem>
              <SelectItem value="approved">承認済</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto border border-border rounded-md">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr>
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">地域</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">用語/説明</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">年</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((card) => {
                const region = regionMap.get(card.region);
                return (
                  <tr
                    key={card.id}
                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                    onClick={() => toggleSelect(card.id)}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(card.id)}
                        onChange={() => toggleSelect(card.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {region?.emoji} {region?.label ?? card.region}
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <span className="text-xs line-clamp-1">
                        {card.type === 'term' && card.name ? card.name : card.description.slice(0, 60)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{card.year}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={card.status as 'draft' | 'ai_generated' | 'reviewed' | 'approved'}
                        className="text-xs"
                      >
                        {STATUS_LABELS[card.status ?? 'draft'] ?? card.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    カードが見つかりません
                  </td>
                </tr>
              )}
              {filtered.length > 100 && (
                <tr>
                  <td colSpan={5} className="py-2 text-center text-xs text-muted-foreground">
                    ...他{filtered.length - 100}件（検索で絞り込んでください）
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <span className="text-xs text-muted-foreground mr-auto">{selected.size}件選択中</span>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleConfirm} disabled={selected.size === 0}>
            追加 ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
