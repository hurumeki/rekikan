'use client';

import { useState } from 'react';
import type { Region, Node, QuizProgress, UnlockCondition } from '@/lib/types';
import { getQuiz, getRootNode, getChildNodes, getNode } from '@/lib/data-loader';
import { getHistoricalStars } from '@/lib/progress';
import { getNodeCoverImageSrc } from '@/lib/images';
import NodeCoverImage from './NodeCoverImage';
import styles from './QuizList.module.css';

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
  progress: Record<string, QuizProgress>;
}

function isNodeUnlocked(node: Node, progress: Record<string, QuizProgress>): boolean {
  if (node.parent_id === null) return true;
  if (!node.unlock_condition) return true;

  const conditions: UnlockCondition[] = Array.isArray(node.unlock_condition)
    ? node.unlock_condition
    : [node.unlock_condition];

  return conditions.every((condition) => {
    if (condition.type === 'complete_quizzes') {
      return condition.quiz_ids.every((qid) => progress[qid]?.cleared === true);
    }
    if (condition.type === 'complete_node') {
      return condition.node_ids.every((nid) => {
        const targetNode = getNode(nid);
        if (!targetNode) return false;
        return targetNode.quiz_ids.every((qid) => progress[qid]?.cleared === true);
      });
    }
    if (condition.type === 'attempts') {
      return (progress[condition.quiz_id]?.attemptCount ?? 0) >= condition.count;
    }
    if (condition.type === 'hint_clear') {
      return progress[condition.quiz_id]?.clearedWithHint === true;
    }
    return false;
  });
}

function formatCondition(condition: UnlockCondition): string {
  if (condition.type === 'complete_quizzes') {
    return condition.quiz_ids
      .map((qid) => `「${getQuiz(qid)?.title ?? qid}」をクリアする`)
      .join('\n');
  }
  if (condition.type === 'complete_node') {
    return condition.node_ids
      .map((nid) => `「${getNode(nid)?.label ?? nid}」をすべてクリアする`)
      .join('\n');
  }
  if (condition.type === 'attempts') {
    const title = getQuiz(condition.quiz_id)?.title ?? condition.quiz_id;
    return `「${title}」を${condition.count}回プレイする`;
  }
  if (condition.type === 'hint_clear') {
    const title = getQuiz(condition.quiz_id)?.title ?? condition.quiz_id;
    return `「${title}」をヒントありでクリアする`;
  }
  return '';
}

export default function QuizList({ region, nodes, onSelectQuiz, onBack, progress }: QuizListProps) {
  const rootNode = getRootNode(region.id);
  const [lockedNode, setLockedNode] = useState<Node | null>(null);

  const renderNode = (node: Node) => {
    const unlocked = isNodeUnlocked(node, progress);
    const children = getChildNodes(node.id);

    const clearedCount = node.quiz_ids.filter((qid) => progress[qid]?.cleared).length;
    const totalCount = node.quiz_ids.length;
    const progressPct = totalCount > 0 ? (clearedCount / totalCount) * 100 : 0;

    const coverSrc = getNodeCoverImageSrc(node);

    return (
      <div key={node.id} className={styles.nodeSection}>
        {coverSrc && <NodeCoverImage src={coverSrc} alt="" />}
        <div className={styles.nodeHeader}>
          <div className={styles.nodeLabel}>{node.label}</div>
          {totalCount > 0 && (
            <div className={styles.nodeProgress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
              </div>
              <span className={styles.progressLabel}>
                {clearedCount} / {totalCount} クリア
              </span>
            </div>
          )}
        </div>
        {node.quiz_ids.map((quizId) => {
          const quiz = getQuiz(quizId);
          if (!quiz) return null;
          const isLocked = !unlocked;
          const stars = getHistoricalStars(progress[quizId], quiz.card_ids.length);

          return (
            <button
              key={quizId}
              className={`${styles.quizItem} ${isLocked ? styles.locked : ''}`}
              onClick={() => {
                if (isLocked) {
                  setLockedNode(node);
                } else {
                  onSelectQuiz(quizId);
                }
              }}
            >
              <span className={styles.quizTitle}>{quiz.title}</span>
              <span className={styles.quizStatus}>
                {isLocked ? '🔒' : <StarDisplay stars={stars} />}
              </span>
            </button>
          );
        })}
        {children.map((child) => renderNode(child))}
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
        <span className={styles.regionEmoji}>{region.emoji}</span>
        <span className={styles.regionLabel}>{region.label}</span>
      </div>
      {rootNode && renderNode(rootNode)}
      {!rootNode && nodes.filter((n) => n.parent_id === null).map((node) => renderNode(node))}

      {lockedNode && (
        <div className={styles.modalOverlay} onClick={() => setLockedNode(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>🔒 ロックされています</div>
            <div className={styles.modalBody}>
              <div className={styles.modalConditionLabel}>アンロック条件:</div>
              {conditions.map((condition, i) => (
                <div key={i} className={styles.modalConditionItem}>
                  ・{formatCondition(condition)}
                </div>
              ))}
            </div>
            <button className={styles.modalClose} onClick={() => setLockedNode(null)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
