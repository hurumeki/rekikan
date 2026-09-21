'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import type { Region, Node, UnlockCondition } from '@/lib/types';
import { getQuiz, getRootNode, getChildNodes } from '@/lib/data-loader';
import { getHistoricalStars } from '@/lib/progress-rules';
import { getNodeCoverImageSrc } from '@/lib/images';
import {
  collectTreeStats,
  describeCondition,
  findAncestorNodeIds,
  findNextQuiz,
  isNodeUnlockedDeep,
  remainingLabel,
} from '@/lib/unlock';
import type { ProgressMap } from '@/lib/progress';
import { stratumColor } from '@/lib/strata';
import { useNewlyUnlockedNodes } from '@/hooks/useNewlyUnlockedNodes';
import NodeCoverImage from './NodeCoverImage';
import styles from './QuizList.module.css';

/** 階層の深さに応じた地層のような見た目の上限（これより深い層は同じ色にする） */
const MAX_DEPTH_STYLE = 3;

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span className={styles.stars} aria-label={`${stars}つ星`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stars ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

interface QuizListProps {
  region: Region;
  nodes: Node[];
  onSelectQuiz: (quizId: string) => void;
  onBack: () => void;
  progress: ProgressMap;
}

export default function QuizList({ region, nodes, onSelectQuiz, onBack, progress }: QuizListProps) {
  const rootNode = getRootNode(region.id);
  const rootNodes = useMemo(
    () => (rootNode ? [rootNode] : nodes.filter((n) => n.parent_id === null)),
    [rootNode, nodes],
  );

  const nextQuizId = useMemo(() => {
    for (const root of rootNodes) {
      const found = findNextQuiz(root, progress);
      if (found) return found;
    }
    return null;
  }, [rootNodes, progress]);

  // 既定の開閉状態: ルートと「つぎはこれ」までの経路だけを開く。
  // 50 問すべてが並ぶ壁にならないよう、それ以外は畳んでおく。
  const defaultExpanded = useMemo(() => {
    const ids = new Set<string>(rootNodes.map((n) => n.id));
    if (nextQuizId) {
      for (const root of rootNodes) {
        for (const id of findAncestorNodeIds(nextQuizId, root)) ids.add(id);
      }
    }
    return ids;
  }, [rootNodes, nextQuizId]);

  // ハイドレーション直後は進捗が空のため、既定の開閉状態は毎レンダー計算し直す。
  // ユーザーが開閉したあとだけ、その操作結果を優先する。
  const [userExpanded, setUserExpanded] = useState<Set<string> | null>(null);
  const expanded = userExpanded ?? defaultExpanded;
  const [lockedNode, setLockedNode] = useState<Node | null>(null);

  // 直前のクイズで解放されたノード（地層が開く演出を 1 度だけ出す）
  const newlyUnlocked = useNewlyUnlockedNodes(region.id);

  const toggleNode = (nodeId: string) => {
    setUserExpanded((prev) => {
      const next = new Set(prev ?? defaultExpanded);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const renderNode = (node: Node, depth: number, siblingIndex = 0, siblingCount = 1) => {
    const unlocked = isNodeUnlockedDeep(node, progress);
    const children = getChildNodes(node.id);
    const isOpen = expanded.has(node.id);

    const stats = collectTreeStats(node, progress);
    const progressPct =
      stats.totalQuizzes > 0 ? (stats.clearedQuizzes / stats.totalQuizzes) * 100 : 0;
    const coverSrc = getNodeCoverImageSrc(node);
    const locked = remainingLabel(node, progress);
    const cleared = stats.totalQuizzes > 0 && stats.clearedQuizzes === stats.totalQuizzes;
    // 兄弟の並び順を時代帯カラーに写像して「地層の断面」に見せる
    const stratum = stratumColor(siblingIndex, siblingCount, region.era_colors);
    const isNew = newlyUnlocked.has(node.id);

    return (
      <div
        key={node.id}
        className={styles.nodeSection}
        data-depth={Math.min(depth, MAX_DEPTH_STYLE)}
        data-locked={!unlocked || undefined}
        data-cleared={cleared || undefined}
        data-new={isNew || undefined}
        // 未発掘の層は時代帯の色を乗せない（CSS 側でくすんだ色になる）
        style={
          stratum && unlocked ? ({ '--stratum-color': stratum } as React.CSSProperties) : undefined
        }
        data-testid="node-section"
      >
        {isNew && (
          <span className={styles.unlockedBadge} data-testid="unlocked-badge">
            ✨ 新しく解放されました
          </span>
        )}
        <button
          type="button"
          className={styles.nodeHeader}
          onClick={() => toggleNode(node.id)}
          aria-expanded={isOpen}
          data-testid="node-toggle"
        >
          <span className={styles.nodeChevron} aria-hidden="true">
            {isOpen ? '▾' : '▸'}
          </span>
          <span className={styles.nodeHeaderMain}>
            <span className={styles.nodeLabel}>
              {!unlocked && <span aria-hidden="true">🔒 </span>}
              {node.label}
            </span>
            {stats.totalQuizzes > 0 && (
              <span className={styles.nodeProgress}>
                <span className={styles.progressBar}>
                  <span className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                </span>
                <span className={styles.progressLabel}>
                  {stats.clearedQuizzes} / {stats.totalQuizzes} クリア
                </span>
              </span>
            )}
          </span>
        </button>

        {!unlocked && locked && isOpen && <div className={styles.lockedHint}>{locked}</div>}

        {isOpen && (
          <div className={styles.nodeBody}>
            {coverSrc && <NodeCoverImage src={coverSrc} alt="" />}
            {node.quiz_ids.map((quizId) => {
              const quiz = getQuiz(quizId);
              if (!quiz) return null;
              const isLocked = !unlocked;
              const stars = getHistoricalStars(progress[quizId], quiz.card_ids.length);
              const isNext = quizId === nextQuizId;

              return (
                <button
                  key={quizId}
                  type="button"
                  className={`${styles.quizItem} ${isLocked ? styles.locked : ''} ${
                    isNext ? styles.nextQuiz : ''
                  }`}
                  onClick={() => {
                    if (isLocked) setLockedNode(node);
                    else onSelectQuiz(quizId);
                  }}
                  data-testid="quiz-item"
                >
                  <span className={styles.quizTitle}>
                    {quiz.title}
                    {isNext && <span className={styles.nextBadge}>つぎはこれ</span>}
                  </span>
                  <span className={styles.quizStatus}>
                    {isLocked ? (
                      <span aria-label="ロック中">🔒</span>
                    ) : (
                      <StarDisplay stars={stars} />
                    )}
                  </span>
                </button>
              );
            })}
            {children.map((child, i) => renderNode(child, depth + 1, i, children.length))}
          </div>
        )}
      </div>
    );
  };

  const conditions: UnlockCondition[] = lockedNode?.unlock_condition
    ? Array.isArray(lockedNode.unlock_condition)
      ? lockedNode.unlock_condition
      : [lockedNode.unlock_condition]
    : [];

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        ← 戻る
      </button>
      <div className={styles.regionHeader}>
        <span className={styles.regionEmoji} aria-hidden="true">
          {region.emoji}
        </span>
        <span className={styles.regionLabel}>{region.label}</span>
      </div>
      {rootNodes.map((node, i) => renderNode(node, 0, i, rootNodes.length))}

      {lockedNode && (
        <div className={styles.modalOverlay} onClick={() => setLockedNode(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="locked-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTitle} id="locked-modal-title">
              🔒 ロックされています
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalConditionLabel}>
                アンロック条件{conditions.length > 1 ? '（いずれか1つ）' : ''}:
              </div>
              {conditions.map((condition, i) => (
                <div key={i} className={styles.modalConditionItem}>
                  ・{describeCondition(condition)}
                </div>
              ))}
            </div>
            <button className={styles.modalClose} onClick={() => setLockedNode(null)} autoFocus>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
