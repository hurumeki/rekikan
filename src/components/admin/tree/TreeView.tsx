'use client';

import { useState, useMemo } from 'react';
import { Plus, ChevronRight, ChevronDown, Circle } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import { NodeEditPanel } from './NodeEditPanel';
import { QuizEditPanel } from './QuizEditPanel';
import { CardEditPanel } from '../cards/CardEditPanel';
import { useAdminStore } from '@/lib/admin/store';
import { buildNodeTree, getQuizStatusSummary } from '@/lib/admin/selectors';
import type { Node } from '@/lib/types';
import { cn } from '@/lib/admin-utils';

function StatusIcon({ status }: { status: 'all_approved' | 'some_reviewed' | 'has_draft' }) {
  if (status === 'all_approved') return <span title="すべて承認済">✅</span>;
  if (status === 'some_reviewed') return <span title="一部レビュー済">🟡</span>;
  return <span title="下書きあり">⬜</span>;
}

function TreeNodeRow({
  node,
  depth,
  tree,
  onEditNode,
  onEditQuiz,
}: {
  node: Node;
  depth: number;
  tree: Map<string | null, Node[]>;
  onEditNode: (id: string) => void;
  onEditQuiz: (id: string) => void;
}) {
  const { state } = useAdminStore();
  const [expanded, setExpanded] = useState(true);

  const children = tree.get(node.id) ?? [];
  const quizzes = node.quiz_ids
    .map((qid) => state.quizzes.find((q) => q.id === qid))
    .filter(Boolean);
  const hasContent = children.length > 0 || quizzes.length > 0;

  return (
    <div>
      {/* Node row */}
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 pr-3 hover:bg-muted/30 rounded cursor-pointer group',
          'text-sm',
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onEditNode(node.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          {hasContent ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <Circle className="h-2 w-2 mx-1" />
          )}
        </button>
        <span className="font-medium text-foreground flex-1">{node.label}</span>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
          {quizzes.length}クイズ
        </span>
      </div>

      {/* Quizzes */}
      {expanded &&
        quizzes.map(
          (quiz) =>
            quiz && (
              <div
                key={quiz.id}
                className="flex items-center gap-2 py-1 pr-3 hover:bg-muted/30 rounded cursor-pointer"
                style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}
                onClick={() => onEditQuiz(quiz.id)}
              >
                <StatusIcon status={getQuizStatusSummary(quiz, state.cards)} />
                <span className="text-sm">{quiz.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {quiz.card_ids.length}枚
                </span>
              </div>
            ),
        )}

      {/* Children */}
      {expanded &&
        children.map((child) => (
          <TreeNodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            tree={tree}
            onEditNode={onEditNode}
            onEditQuiz={onEditQuiz}
          />
        ))}
    </div>
  );
}

export function TreeView() {
  const { state } = useAdminStore();
  const [regionFilter, setRegionFilter] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeOpen, setNodeOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [detailCardId, setDetailCardId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredRegions = regionFilter
    ? state.regions.filter((r) => r.id === regionFilter)
    : state.regions;

  const tree = useMemo(() => buildNodeTree(state.nodes), [state.nodes]);

  function openEditNode(id: string) {
    setEditingNodeId(id);
    setNodeOpen(true);
  }

  function openNewNode(regionId?: string) {
    setEditingNodeId('__new__');
    setNodeOpen(true);
    if (regionId) {
      // Pre-set region — handled inside panel via initial state
    }
  }

  function openEditQuiz(id: string) {
    setEditingQuizId(id);
    setQuizOpen(true);
  }

  function openNewQuiz() {
    setEditingQuizId('__new__');
    setQuizOpen(true);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-2 px-3 py-2 border-b border-border shrink-0 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold whitespace-nowrap">ツリー・クイズ管理</h2>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={regionFilter || '__all__'}
            onValueChange={(v) => setRegionFilter(v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="flex-1 min-w-32 md:flex-none md:w-40 h-8">
              <SelectValue placeholder="すべての地域" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">すべての地域</SelectItem>
              {state.regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.emoji} {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => openNewNode()}>
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">ノード追加</span>
            <span className="md:hidden">ノード</span>
          </Button>
          <Button size="sm" onClick={openNewQuiz}>
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">クイズ追加</span>
            <span className="md:hidden">クイズ</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {filteredRegions.map((region) => {
          const rootNodes = (tree.get(null) ?? []).filter((n) => n.region === region.id);
          return (
            <div key={region.id} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 bg-muted/40 rounded mb-1">
                <span className="font-semibold text-sm">
                  {region.emoji} {region.label}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {state.nodes.filter((n) => n.region === region.id).length}ノード /
                  {state.quizzes.filter((q) => q.region === region.id).length}クイズ
                </span>
              </div>
              {rootNodes.length === 0 && (
                <p className="text-xs text-muted-foreground px-3 py-2">ノードなし</p>
              )}
              {rootNodes.map((node) => (
                <TreeNodeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  tree={tree}
                  onEditNode={openEditNode}
                  onEditQuiz={openEditQuiz}
                />
              ))}
            </div>
          );
        })}
      </div>

      <NodeEditPanel nodeId={editingNodeId} open={nodeOpen} onOpenChange={setNodeOpen} />
      <QuizEditPanel
        quizId={editingQuizId}
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onOpenCardDetail={(cardId) => {
          setDetailCardId(cardId);
          setDetailOpen(true);
        }}
      />
      <CardEditPanel
        cardId={detailCardId}
        open={detailOpen}
        onOpenChange={(next) => {
          setDetailOpen(next);
          if (!next) {
            // Radix DialogPrimitive leaves body pointer-events disabled when one
            // modal closes while another is still open; reset so the underlying
            // QuizEditPanel stays interactive.
            requestAnimationFrame(() => {
              document.body.style.pointerEvents = '';
            });
          }
        }}
      />
    </div>
  );
}
