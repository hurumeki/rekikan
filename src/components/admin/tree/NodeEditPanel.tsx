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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin-ui/select';
import { useAdminStore } from '@/lib/admin/store';
import { generateNodeId, ensureUnique } from '@/lib/admin/id-generator';
import type { Node, UnlockCondition } from '@/lib/types';
import { QuizEditPanel } from './QuizEditPanel';

interface Props {
  nodeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_NODE: Partial<Node> = {
  label: '',
  region: '',
  parent_id: null,
  sort_order: 0,
  quiz_ids: [],
  unlock_condition: null,
};

export function NodeEditPanel({ nodeId, open, onOpenChange }: Props) {
  const { state, dispatch } = useAdminStore();
  const [form, setForm] = useState<Partial<Node>>(EMPTY_NODE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unlockType, setUnlockType] = useState<string>('none');
  const [unlockQuizId, setUnlockQuizId] = useState('');
  const [unlockCount, setUnlockCount] = useState(3);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizPanelOpen, setQuizPanelOpen] = useState(false);

  const isNew = nodeId === '__new__';

  useEffect(() => {
    if (!open) return;
    if (isNew) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setForm({ ...EMPTY_NODE, quiz_ids: [] });
      setUnlockType('none');
      /* eslint-enable react-hooks/set-state-in-effect */
    } else if (nodeId) {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (node) {
         
        setForm({ ...node });
        const uc = Array.isArray(node.unlock_condition) ? node.unlock_condition[0] : node.unlock_condition;
        if (uc) {
          setUnlockType(uc.type);
          if ('quiz_id' in uc) setUnlockQuizId(uc.quiz_id);
          if ('count' in uc) setUnlockCount(uc.count);
        } else {
          setUnlockType('none');
        }
         
      }
    }
     
    setErrors({});
  }, [nodeId, open, isNew, state.nodes]);

  function set(partial: Partial<Node>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function buildUnlockCondition(): UnlockCondition | null {
    if (unlockType === 'none') return null;
    if (unlockType === 'complete_quizzes') return { type: 'complete_quizzes', quiz_ids: unlockQuizId ? [unlockQuizId] : [] };
    if (unlockType === 'attempts') return { type: 'attempts', quiz_id: unlockQuizId, count: unlockCount };
    if (unlockType === 'hint_clear') return { type: 'hint_clear', quiz_id: unlockQuizId };
    return null;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.label?.trim()) errs.label = 'ラベルを入力してください';
    if (!form.region) errs.region = 'リージョンを選択してください';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    let id = form.id;
    if (!id || isNew) {
      const existingIds = new Set(state.nodes.map((n) => n.id));
      const generated = generateNodeId(form.region ?? '', form.label ?? '');
      id = ensureUnique(generated, existingIds);
    }
    const node: Node = {
      id: id!,
      region: form.region!,
      parent_id: form.parent_id ?? null,
      label: form.label!,
      sort_order: Number(form.sort_order ?? 0),
      quiz_ids: form.quiz_ids ?? [],
      unlock_condition: buildUnlockCondition(),
    };
    dispatch({ type: 'UPSERT_NODE', node });
    onOpenChange(false);
  }

  function handleDelete() {
    if (!form.id || !confirm('このノードを削除しますか？')) return;
    dispatch({ type: 'DELETE_NODE', id: form.id });
    onOpenChange(false);
  }

  function openNewQuiz() {
    setEditingQuizId('__new__');
    setQuizPanelOpen(true);
  }

  function openEditQuiz(quizId: string) {
    setEditingQuizId(quizId);
    setQuizPanelOpen(true);
  }

  // Nodes in same region for parent selection
  const sameRegionNodes = state.nodes.filter(
    (n) => n.region === form.region && n.id !== form.id
  );

  // Quizzes for this node
  const nodeQuizzes = (form.quiz_ids ?? []).map((qid) => state.quizzes.find((q) => q.id === qid)).filter(Boolean);

  // All quizzes for unlock condition picker
  const regionQuizzes = state.quizzes.filter((q) => q.region === form.region);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{isNew ? 'ノードを作成' : 'ノードを編集'}</SheetTitle>
            {form.id && !isNew && (
              <p className="text-xs text-muted-foreground font-mono">ID: {form.id}</p>
            )}
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>ラベル {errors.label && <span className="text-destructive text-xs ml-1">{errors.label}</span>}</Label>
              <Input value={form.label ?? ''} onChange={(e) => set({ label: e.target.value })} placeholder="例: 日本の古代" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>リージョン {errors.region && <span className="text-destructive text-xs ml-1">{errors.region}</span>}</Label>
                <Select value={form.region || ''} onValueChange={(v) => set({ region: v, parent_id: null })}>
                  <SelectTrigger><SelectValue placeholder="リージョン" /></SelectTrigger>
                  <SelectContent>
                    {state.regions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.emoji} {r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>表示順</Label>
                <Input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => set({ sort_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>親ノード</Label>
              <Select
                value={form.parent_id ?? '__none__'}
                onValueChange={(v) => set({ parent_id: v === '__none__' ? null : v })}
                disabled={!form.region}
              >
                <SelectTrigger><SelectValue placeholder="なし（ルートノード）" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">なし（ルートノード）</SelectItem>
                  {sameRegionNodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unlock Condition */}
            <div className="space-y-2 border border-border rounded-md p-3">
              <Label>解放条件</Label>
              <Select value={unlockType} onValueChange={setUnlockType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし（最初から解放）</SelectItem>
                  <SelectItem value="complete_quizzes">クイズクリア</SelectItem>
                  <SelectItem value="attempts">N回挑戦後に解放</SelectItem>
                  <SelectItem value="hint_clear">ヒント使用クリア</SelectItem>
                </SelectContent>
              </Select>
              {unlockType !== 'none' && (
                <div className="space-y-2 mt-2">
                  <Label className="text-xs">対象クイズ</Label>
                  <Select value={unlockQuizId} onValueChange={setUnlockQuizId}>
                    <SelectTrigger><SelectValue placeholder="クイズを選択" /></SelectTrigger>
                    <SelectContent>
                      {regionQuizzes.map((q) => (
                        <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {unlockType === 'attempts' && (
                    <div className="space-y-1">
                      <Label className="text-xs">挑戦回数</Label>
                      <Input
                        type="number"
                        value={unlockCount}
                        min={1}
                        onChange={(e) => setUnlockCount(parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Child Quizzes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>クイズ一覧</Label>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={openNewQuiz}>
                  + クイズを追加
                </Button>
              </div>
              <div className="border border-border rounded-md overflow-hidden">
                {nodeQuizzes.length === 0 && (
                  <div className="py-3 text-center text-xs text-muted-foreground">クイズなし</div>
                )}
                {nodeQuizzes.map((quiz) => quiz && (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between px-3 py-2 border-b border-border/50 last:border-0 hover:bg-muted/30"
                  >
                    <span className="text-sm">{quiz.title}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => openEditQuiz(quiz.id)}>
                        編集
                      </Button>
                      <button
                        onClick={() => set({ quiz_ids: (form.quiz_ids ?? []).filter((id) => id !== quiz.id) })}
                        className="text-xs text-muted-foreground hover:text-destructive px-1"
                      >
                        外す
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex justify-between">
            {!isNew && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>削除</Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <QuizEditPanel
        quizId={editingQuizId}
        open={quizPanelOpen}
        onOpenChange={setQuizPanelOpen}
      />
    </>
  );
}
