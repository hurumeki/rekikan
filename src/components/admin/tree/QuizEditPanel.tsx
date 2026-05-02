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
import { Label } from '@/components/admin-ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import { Badge } from '@/components/admin-ui/badge';
import { CardPickerDialog } from './CardPickerDialog';
import { useAdminStore } from '@/lib/admin/store';
import { generateQuizId, ensureUnique } from '@/lib/admin/id-generator';
import type { Quiz, GameMode } from '@/lib/types';
import { GripVertical, Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/admin-utils';

const STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  ai_generated: 'AI生成',
  reviewed: 'レビュー済',
  approved: '承認済',
};

interface Props {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCardDetail?: (cardId: string) => void;
}

const EMPTY_QUIZ: Partial<Quiz> = {
  title: '',
  region: '',
  card_type: 'term',
  card_ids: [],
  modes: ['careful', 'challenge'],
  difficulty: 2,
};

export function QuizEditPanel({ quizId, open, onOpenChange, onOpenCardDetail }: Props) {
  const { state, dispatch } = useAdminStore();
  const [form, setForm] = useState<Partial<Quiz>>(EMPTY_QUIZ);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const isNew = quizId === '__new__';

  useEffect(() => {
    if (!open) return;
    if (isNew) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ ...EMPTY_QUIZ, card_ids: [] });
    } else if (quizId) {
      const quiz = state.quizzes.find((q) => q.id === quizId);

      setForm(quiz ? { ...quiz } : EMPTY_QUIZ);
    }

    setErrors({});
  }, [quizId, open, isNew, state.quizzes]);

  function set(partial: Partial<Quiz>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function toggleMode(mode: GameMode) {
    const modes = form.modes ?? [];
    const next = modes.includes(mode) ? modes.filter((m) => m !== mode) : [...modes, mode];
    set({ modes: next });
  }

  function handleAddCards(cards: typeof state.cards) {
    const currentIds = form.card_ids ?? [];
    const newIds = cards.map((c) => c.id).filter((id) => !currentIds.includes(id));
    // Auto-sort new additions by year
    const allIds = [...currentIds, ...newIds];
    const cardMap = new Map(state.cards.map((c) => [c.id, c]));
    const sorted = allIds.sort((a, b) => {
      const ca = cardMap.get(a);
      const cb = cardMap.get(b);
      return (ca?.year ?? 0) - (cb?.year ?? 0);
    });
    set({ card_ids: sorted });
  }

  function removeCard(id: string) {
    set({ card_ids: (form.card_ids ?? []).filter((cid) => cid !== id) });
  }

  function sortByDate() {
    const cardMap = new Map(state.cards.map((c) => [c.id, c]));
    const sorted = [...(form.card_ids ?? [])].sort((a, b) => {
      const ca = cardMap.get(a);
      const cb = cardMap.get(b);
      return (ca?.year ?? 0) - (cb?.year ?? 0);
    });
    set({ card_ids: sorted });
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const ids = [...(form.card_ids ?? [])];
    const [moved] = ids.splice(dragIdx, 1);
    ids.splice(idx, 0, moved);
    setDragIdx(idx);
    set({ card_ids: ids });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title?.trim()) errs.title = 'タイトルを入力してください';
    if (!form.region) errs.region = 'リージョンを選択してください';
    if (!form.card_type) errs.card_type = 'カード種別を選択してください';
    if (!form.modes || form.modes.length === 0) errs.modes = 'モードを1つ以上選択してください';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    let id = form.id;
    if (!id || isNew) {
      const existingIds = new Set(state.quizzes.map((q) => q.id));
      const generated = generateQuizId(form.region ?? '', form.title ?? '');
      id = ensureUnique(generated, existingIds);
    }
    const quiz: Quiz = {
      id: id!,
      region: form.region!,
      title: form.title!,
      card_type: form.card_type!,
      card_ids: form.card_ids ?? [],
      modes: form.modes as GameMode[],
      difficulty: Number(form.difficulty ?? 2),
    };
    dispatch({ type: 'UPSERT_QUIZ', quiz });
    onOpenChange(false);
  }

  const cardMap = new Map(state.cards.map((c) => [c.id, c]));
  const cardCount = (form.card_ids ?? []).length;
  const countOk = cardCount >= 5 && cardCount <= 8;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isNew ? 'クイズを作成' : 'クイズを編集'}</SheetTitle>
          {form.id && !isNew && (
            <p className="text-xs text-muted-foreground font-mono">ID: {form.id}</p>
          )}
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              タイトル{' '}
              {errors.title && (
                <span className="text-destructive text-xs ml-1">{errors.title}</span>
              )}
            </Label>
            <Input
              value={form.title ?? ''}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="クイズのタイトル"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                リージョン{' '}
                {errors.region && (
                  <span className="text-destructive text-xs ml-1">{errors.region}</span>
                )}
              </Label>
              <Select value={form.region || ''} onValueChange={(v) => set({ region: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="リージョン" />
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
            <div className="space-y-1.5">
              <Label>
                カード種別{' '}
                {errors.card_type && (
                  <span className="text-destructive text-xs ml-1">{errors.card_type}</span>
                )}
              </Label>
              <Select
                value={form.card_type || ''}
                onValueChange={(v) => set({ card_type: v as 'term' | 'description' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="種別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term">用語</SelectItem>
                  <SelectItem value="description">説明文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>難易度</Label>
              <Select
                value={String(form.difficulty ?? 2)}
                onValueChange={(v) => set({ difficulty: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      ★ {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                モード{' '}
                {errors.modes && (
                  <span className="text-destructive text-xs ml-1">{errors.modes}</span>
                )}
              </Label>
              <div className="flex gap-3 pt-1">
                {(['careful', 'challenge'] as GameMode[]).map((m) => (
                  <label key={m} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={(form.modes ?? []).includes(m)}
                      onChange={() => toggleMode(m)}
                      className="accent-primary"
                    />
                    {m === 'careful' ? '丁寧' : 'チャレンジ'}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Card composition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                カード構成{' '}
                <span
                  className={cn(
                    'text-xs font-normal',
                    countOk ? 'text-green-600' : 'text-orange-500',
                  )}
                >
                  ({cardCount}枚{!countOk && '、推奨5〜8枚'})
                </span>
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={sortByDate}>
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  年順に並替
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPickerOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  カードを追加
                </Button>
              </div>
            </div>
            <div className="border border-border rounded-md overflow-hidden">
              {(form.card_ids ?? []).length === 0 && (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  カードがありません。「カードを追加」から選択してください
                </div>
              )}
              {(form.card_ids ?? []).map((cardId, idx) => {
                const card = cardMap.get(cardId);
                return (
                  <div
                    key={cardId}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    className="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-0 hover:bg-muted/30"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}</span>
                    {card ? (
                      <button
                        type="button"
                        onClick={() => onOpenCardDetail?.(cardId)}
                        className="flex flex-1 items-center gap-2 text-left min-w-0 hover:underline"
                      >
                        <span className="flex-1 text-xs line-clamp-1">
                          {card.type === 'term' && card.name
                            ? card.name
                            : card.description.slice(0, 50)}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{card.year}</span>
                        <Badge
                          variant={
                            card.status as 'draft' | 'ai_generated' | 'reviewed' | 'approved'
                          }
                          className="text-xs shrink-0"
                        >
                          {STATUS_LABELS[card.status ?? 'draft'] ?? card.status}
                        </Badge>
                      </button>
                    ) : (
                      <span className="flex-1 text-xs text-destructive">
                        不明なカード: {cardId}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeCard(cardId)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="カードを削除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </SheetFooter>
      </SheetContent>

      <CardPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={form.card_ids ?? []}
        onSelect={handleAddCards}
      />
    </Sheet>
  );
}
