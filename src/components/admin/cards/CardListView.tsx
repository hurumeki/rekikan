'use client';

import { useState, useMemo } from 'react';
import { Plus, Copy, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Badge } from '@/components/admin-ui/badge';
import { CardFilters, type CardFilterState } from './CardFilters';
import { BulkActionsBar } from './BulkActionsBar';
import { CardEditPanel } from './CardEditPanel';
import { useAdminStore } from '@/lib/admin/store';
import { getCardUsageCount } from '@/lib/admin/selectors';
import type { Card } from '@/lib/types';
import { cn } from '@/lib/admin-utils';

type SortKey = 'region' | 'era_color_key' | 'category' | 'name' | 'year' | 'status' | 'usage';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-20" />;
  return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
}

function Th({ col, label, sortKey, sortDir, onSort }: { col: SortKey; label: string; sortKey: SortKey; sortDir: SortDir; onSort: (col: SortKey) => void }) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </th>
  );
}

const STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  ai_generated: 'AI生成',
  reviewed: 'レビュー済',
  approved: '承認済',
};

const INITIAL_FILTERS: CardFilterState = {
  regionId: '',
  eraColorKey: '',
  category: '',
  cardType: '',
  status: '',
  search: '',
};

const PAGE_SIZE = 50;

export function CardListView() {
  const { state, dispatch } = useAdminStore();
  const [filters, setFilters] = useState<CardFilterState>(INITIAL_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);

  const usageMap = useMemo(() => getCardUsageCount(state), [state]);

  const regionMap = useMemo(() => new Map(state.regions.map((r) => [r.id, r])), [state.regions]);

  // Filter
  const filtered = useMemo(() => {
    return state.cards.filter((c) => {
      if (filters.regionId && c.region !== filters.regionId) return false;
      if (filters.eraColorKey && c.era_color_key !== filters.eraColorKey) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.cardType && c.type !== filters.cardType) return false;
      // Cards without a status field are treated as 'draft'
      if (filters.status && (c.status ?? 'draft') !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const inName = c.name?.toLowerCase().includes(q) ?? false;
        const inDesc = c.description.toLowerCase().includes(q);
        const inId = c.id.toLowerCase().includes(q);
        if (!inName && !inDesc && !inId) return false;
      }
      return true;
    });
  }, [state.cards, filters]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'region': cmp = a.region.localeCompare(b.region); break;
        case 'era_color_key': cmp = a.era_color_key.localeCompare(b.era_color_key); break;
        case 'category': cmp = (a.category ?? '').localeCompare(b.category ?? ''); break;
        case 'name': cmp = (a.name ?? a.description).localeCompare(b.name ?? b.description); break;
        case 'year': cmp = a.year - b.year; break;
        case 'status': cmp = (a.status ?? '').localeCompare(b.status ?? ''); break;
        case 'usage': cmp = (usageMap.get(a.id) ?? 0) - (usageMap.get(b.id) ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, usageMap]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((c) => c.id)));
    }
  }

  function openEdit(cardId: string) {
    setEditingCardId(cardId);
    setEditOpen(true);
  }

  function openNew() {
    setEditingCardId('__new__');
    setEditOpen(true);
  }

  function handleDuplicate(card: Card) {
    const existingIds = new Set(state.cards.map((c) => c.id));
    let newId = `${card.id}_copy`;
    let counter = 2;
    while (existingIds.has(newId)) newId = `${card.id}_copy${counter++}`;
    dispatch({ type: 'UPSERT_CARD', card: { ...card, id: newId } });
  }

  function handleDelete(id: string) {
    if (!confirm('このカードを削除しますか？')) return;
    dispatch({ type: 'DELETE_CARDS', ids: [id] });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-sm font-semibold">カード管理</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" />
          新規カード
        </Button>
      </div>

      <CardFilters
        filters={filters}
        onChange={(f) => { setFilters(f); setPage(1); }}
        regions={state.regions}
        categories={state.categories}
      />

      <BulkActionsBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-background border-b border-border">
            <tr>
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selectedIds.size === paginated.length}
                  onChange={toggleSelectAll}
                  className="accent-primary"
                />
              </th>
              <Th col="region" label="地域" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th col="era_color_key" label="時代帯" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th col="category" label="分類" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th col="name" label="用語/説明" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th col="year" label="年" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th col="status" label="ステータス" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th col="usage" label="使用数" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((card) => {
              const region = regionMap.get(card.region);
              const era = region?.era_colors[card.era_color_key];
              const usage = usageMap.get(card.id) ?? 0;
              const catDef = state.categories.find((c) => c.value === card.category);
              return (
                <tr
                  key={card.id}
                  className={cn(
                    'border-b border-border/50 hover:bg-muted/30 transition-colors',
                    selectedIds.has(card.id) && 'bg-primary/5'
                  )}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(card.id)}
                      onChange={() => toggleSelect(card.id)}
                      className="accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-xs">{region?.emoji} {region?.label ?? card.region}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {era && (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: era.color }} />
                        {era.label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {catDef ? `${catDef.icon}` : '—'}
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <span className="text-xs line-clamp-2">
                      {card.type === 'term' && card.name ? (
                        <span className="font-medium">{card.name}</span>
                      ) : (
                        card.description.slice(0, 80)
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">{card.year}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={(card.status ?? 'draft') as 'draft' | 'ai_generated' | 'reviewed' | 'approved'}
                      className="text-xs"
                    >
                      {STATUS_LABELS[card.status ?? 'draft']}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-center">{usage}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(card.id)}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="編集"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(card)}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="複製"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  カードが見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{sorted.length}件中 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}件表示</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted">前</button>
            <span className="px-2 py-1">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted">次</button>
          </div>
        </div>
      )}

      <CardEditPanel
        cardId={editingCardId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
