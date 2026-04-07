'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/admin-ui/sheet';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Textarea } from '@/components/admin-ui/textarea';
import { Label } from '@/components/admin-ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin-ui/select';
import { Badge } from '@/components/admin-ui/badge';
import { useAdminStore } from '@/lib/admin/store';
import { isHintOrderRevealing } from '@/lib/admin/validation';
import { generateCardId, ensureUnique } from '@/lib/admin/id-generator';
import type { Card, CardType, ReviewStatus, Category } from '@/lib/types';

interface Props {
  cardId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_CARD: Partial<Card> = {
  type: 'term',
  region: '',
  name: null,
  year: 0,
  year_end: null,
  era_color_key: '',
  category: null,
  hint: null,
  description: '',
  status: 'draft',
};

export function CardEditPanel({ cardId, open, onOpenChange }: Props) {
  const { state, dispatch } = useAdminStore();
  const [form, setForm] = useState<Partial<Card>>(EMPTY_CARD);
  const [hintWarning, setHintWarning] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isNew = cardId === '__new__';

  useEffect(() => {
    if (!open) return;
    if (isNew) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ ...EMPTY_CARD });
    } else if (cardId) {
      const card = state.cards.find((c) => c.id === cardId);
       
      setForm(card ? { ...card } : EMPTY_CARD);
    }
     
    setErrors({});
     
    setHintWarning(false);
  }, [cardId, open, isNew, state.cards]);

  function set(partial: Partial<Card>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleHintChange(hint: string) {
    set({ hint: hint || null });
    setHintWarning(hint ? isHintOrderRevealing(hint) : false);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.region) errs.region = 'リージョンを選択してください';
    if (!form.era_color_key) errs.era_color_key = '時代帯を選択してください';
    if (!form.description?.trim()) errs.description = '説明文を入力してください';
    if (form.type === 'term' && !form.name?.trim()) errs.name = '用語名を入力してください';
    if (form.year == null || isNaN(form.year as number)) errs.year = '年を入力してください';
    if (!form.status) errs.status = 'ステータスを選択してください';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    let id = form.id;
    if (!id || isNew) {
      const existingIds = new Set(state.cards.map((c) => c.id));
      const generated = generateCardId(
        form.region ?? '',
        form.era_color_key ?? '',
        form.name ?? form.description ?? ''
      );
      id = ensureUnique(generated, existingIds);
    }

    const card: Card = {
      id: id!,
      region: form.region!,
      type: form.type as CardType,
      name: form.type === 'term' ? (form.name ?? null) : null,
      year: Number(form.year),
      year_end: form.year_end ? Number(form.year_end) : null,
      era_color_key: form.era_color_key!,
      category: (form.category as Category | null) ?? null,
      hint: form.hint ?? null,
      description: form.description!,
      status: form.status as ReviewStatus,
      tags: form.tags,
    };

    dispatch({ type: 'UPSERT_CARD', card });
    onOpenChange(false);
  }

  // Current region's era bands
  const region = state.regions.find((r) => r.id === form.region);
  const eraBands = region ? Object.entries(region.era_colors) : [];

  // Quizzes that use this card
  const usedInQuizzes = cardId && !isNew
    ? state.quizzes.filter((q) => q.card_ids.includes(cardId))
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isNew ? 'カードを作成' : 'カードを編集'}</SheetTitle>
          {form.id && !isNew && (
            <p className="text-xs text-muted-foreground font-mono">ID: {form.id}</p>
          )}
        </SheetHeader>

        <div className="space-y-4">
          {/* Card Type */}
          <div className="space-y-1.5">
            <Label>カード種別</Label>
            <div className="flex gap-4">
              {(['term', 'description'] as CardType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    value={t}
                    checked={form.type === t}
                    onChange={() => set({ type: t })}
                    className="accent-primary"
                  />
                  {t === 'term' ? '用語' : '説明文'}
                </label>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <Label>リージョン {errors.region && <span className="text-destructive text-xs ml-1">{errors.region}</span>}</Label>
            <Select value={form.region || ''} onValueChange={(v) => set({ region: v, era_color_key: '' })}>
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

          {/* Name (term only) */}
          {form.type === 'term' && (
            <div className="space-y-1.5">
              <Label>用語名 {errors.name && <span className="text-destructive text-xs ml-1">{errors.name}</span>}</Label>
              <Input
                value={form.name ?? ''}
                onChange={(e) => set({ name: e.target.value || null })}
                placeholder="例: 大化の改新"
              />
            </div>
          )}

          {/* Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>年 {errors.year && <span className="text-destructive text-xs ml-1">{errors.year}</span>}</Label>
              <Input
                type="number"
                value={form.year ?? ''}
                onChange={(e) => set({ year: parseInt(e.target.value) })}
                placeholder="例: 645"
              />
            </div>
            <div className="space-y-1.5">
              <Label>終了年（任意）</Label>
              <Input
                type="number"
                value={form.year_end ?? ''}
                onChange={(e) => set({ year_end: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="例: 1868"
              />
            </div>
          </div>

          {/* Era Color Key */}
          <div className="space-y-1.5">
            <Label>時代帯 {errors.era_color_key && <span className="text-destructive text-xs ml-1">{errors.era_color_key}</span>}</Label>
            <Select
              value={form.era_color_key || ''}
              onValueChange={(v) => set({ era_color_key: v })}
              disabled={!form.region}
            >
              <SelectTrigger>
                <SelectValue placeholder={form.region ? '時代帯を選択' : 'リージョンを先に選択'} />
              </SelectTrigger>
              <SelectContent>
                {eraBands.map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: value.color }}
                      />
                      {value.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>カテゴリ</Label>
            <Select
              value={form.category ?? '__none__'}
              onValueChange={(v) => set({ category: v === '__none__' ? null : (v as Category) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択（任意）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">なし</SelectItem>
                {state.categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hint */}
          <div className="space-y-1.5">
            <Label>ヒント（任意）</Label>
            <Input
              value={form.hint ?? ''}
              onChange={(e) => handleHintChange(e.target.value)}
              placeholder="例: 聖徳太子が定めた..."
            />
            {hintWarning && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                ⚠️ ヒントに順序を示す情報が含まれている可能性があります
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>説明文 {errors.description && <span className="text-destructive text-xs ml-1">{errors.description}</span>}</Label>
            <Textarea
              value={form.description ?? ''}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="例: 飛鳥時代に蘇我氏を倒した政変..."
              rows={4}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>ステータス {errors.status && <span className="text-destructive text-xs ml-1">{errors.status}</span>}</Label>
            <Select value={form.status || ''} onValueChange={(v) => set({ status: v as ReviewStatus })}>
              <SelectTrigger>
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="ai_generated">AI生成</SelectItem>
                <SelectItem value="reviewed">レビュー済</SelectItem>
                <SelectItem value="approved">承認済</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Usage */}
          {usedInQuizzes.length > 0 && (
            <div className="space-y-1.5">
              <Label>使用中のクイズ</Label>
              <div className="flex flex-wrap gap-1">
                {usedInQuizzes.map((q) => (
                  <Badge key={q.id} variant="secondary" className="text-xs">
                    {q.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
