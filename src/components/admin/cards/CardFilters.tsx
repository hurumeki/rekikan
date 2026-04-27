'use client';

import { useMemo } from 'react';
import { Input } from '@/components/admin-ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import type { Region } from '@/lib/types';
import type { CategoryDef } from '@/lib/admin/categories';

export interface CardFilterState {
  regionId: string;
  eraColorKey: string;
  category: string;
  cardType: string;
  status: string;
  search: string;
}

interface Props {
  filters: CardFilterState;
  onChange: (filters: CardFilterState) => void;
  regions: Region[];
  categories: CategoryDef[];
}

const INITIAL_FILTERS: CardFilterState = {
  regionId: '',
  eraColorKey: '',
  category: '',
  cardType: '',
  status: '',
  search: '',
};

export function CardFilters({ filters, onChange, regions, categories }: Props) {
  function set(partial: Partial<CardFilterState>) {
    onChange({ ...filters, ...partial });
  }

  // Derive era bands from selected region or all regions
  const eraOptions = useMemo(() => {
    const out: { key: string; label: string; regionId: string }[] = [];
    const seenKeys = new Set<string>();
    for (const region of regions) {
      if (filters.regionId && region.id !== filters.regionId) continue;
      for (const [key, value] of Object.entries(region.era_colors)) {
        if (!seenKeys.has(key)) {
          out.push({ key, label: value.label, regionId: region.id });
          seenKeys.add(key);
        }
      }
    }
    return out;
  }, [regions, filters.regionId]);

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-muted/20">
      <Input
        placeholder="キーワード検索..."
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
        className="w-48"
      />
      <Select
        value={filters.regionId || '__all__'}
        onValueChange={(v) => set({ regionId: v === '__all__' ? '' : v, eraColorKey: '' })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="リージョン" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">すべて</SelectItem>
          {regions.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.emoji} {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.eraColorKey || '__all__'}
        onValueChange={(v) => set({ eraColorKey: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="時代帯" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">すべて</SelectItem>
          {eraOptions.map((e) => (
            <SelectItem key={`${e.regionId}:${e.key}`} value={e.key}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.category || '__all__'}
        onValueChange={(v) => set({ category: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="カテゴリ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">すべて</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.icon} {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.cardType || '__all__'}
        onValueChange={(v) => set({ cardType: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="種別" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">すべて</SelectItem>
          <SelectItem value="term">用語</SelectItem>
          <SelectItem value="description">説明文</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status || '__all__'}
        onValueChange={(v) => set({ status: v === '__all__' ? '' : v })}
      >
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
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => onChange(INITIAL_FILTERS)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          クリア
        </button>
      )}
    </div>
  );
}
