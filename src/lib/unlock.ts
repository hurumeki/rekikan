import type { Node, QuizProgress, UnlockCondition } from './types';
import { getQuiz, getNode, getChildNodes } from './data-loader';

export type ProgressMap = Record<string, QuizProgress>;

function toConditions(node: Node): UnlockCondition[] {
  if (!node.unlock_condition) return [];
  return Array.isArray(node.unlock_condition) ? node.unlock_condition : [node.unlock_condition];
}

function isConditionMet(condition: UnlockCondition, progress: ProgressMap): boolean {
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
}

/** ノード自身のアンロック条件を満たしているか（親は見ない）。 */
export function isNodeUnlocked(node: Node, progress: ProgressMap): boolean {
  if (node.parent_id === null) return true;
  return toConditions(node).every((c) => isConditionMet(c, progress));
}

/**
 * 祖先も含めて解放されているか。
 * 条件を持たない子ノードでも、親がロックされていれば遊べない。
 */
export function isNodeUnlockedDeep(node: Node, progress: ProgressMap): boolean {
  let current: Node | undefined = node;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current.id)) break; // 循環データへの保険
    seen.add(current.id);
    if (!isNodeUnlocked(current, progress)) return false;
    current = current.parent_id ? getNode(current.parent_id) : undefined;
  }
  return true;
}

/** アンロック条件を日本語 1 行で説明する。 */
export function describeCondition(condition: UnlockCondition): string {
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

/** 条件の達成度（達成数 / 必要数）。数えられない条件は null。 */
export function conditionProgress(
  condition: UnlockCondition,
  progress: ProgressMap,
): { done: number; total: number } | null {
  if (condition.type === 'complete_quizzes') {
    const done = condition.quiz_ids.filter((qid) => progress[qid]?.cleared === true).length;
    return { done, total: condition.quiz_ids.length };
  }
  if (condition.type === 'complete_node') {
    const quizIds = condition.node_ids.flatMap((nid) => getNode(nid)?.quiz_ids ?? []);
    const done = quizIds.filter((qid) => progress[qid]?.cleared === true).length;
    return { done, total: quizIds.length };
  }
  if (condition.type === 'attempts') {
    const done = Math.min(progress[condition.quiz_id]?.attemptCount ?? 0, condition.count);
    return { done, total: condition.count };
  }
  return null;
}

/** ロック中のノードについて「あと何問でひらくか」を短い文にする。 */
export function remainingLabel(node: Node, progress: ProgressMap): string | null {
  const totals = toConditions(node)
    .map((c) => conditionProgress(c, progress))
    .filter((p): p is { done: number; total: number } => p !== null);
  if (totals.length === 0) return null;
  const remaining = totals.reduce((sum, p) => sum + Math.max(0, p.total - p.done), 0);
  return remaining > 0 ? `あと${remaining}問でひらく` : null;
}

export interface TreeStats {
  clearedQuizzes: number;
  totalQuizzes: number;
}

/** ノード配下（自分自身を含む）のクリア状況を集計する。 */
export function collectTreeStats(node: Node, progress: ProgressMap): TreeStats {
  let cleared = 0;
  let total = 0;
  const walk = (n: Node) => {
    for (const qid of n.quiz_ids) {
      total++;
      if (progress[qid]?.cleared) cleared++;
    }
    for (const child of getChildNodes(n.id)) walk(child);
  };
  walk(node);
  return { clearedQuizzes: cleared, totalQuizzes: total };
}

/**
 * 「つぎはこれ」を決める。木を上から順に辿り、
 * 解放済みでまだクリアしていない最初のクイズを返す。
 */
export function findNextQuiz(root: Node, progress: ProgressMap): string | null {
  const walk = (node: Node): string | null => {
    if (!isNodeUnlocked(node, progress)) return null;
    for (const qid of node.quiz_ids) {
      if (!progress[qid]?.cleared) return qid;
    }
    for (const child of getChildNodes(node.id)) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };
  return walk(root);
}

/** ある子孫にたどり着くまでの祖先ノード ID をすべて返す。 */
export function findAncestorNodeIds(quizId: string, root: Node): string[] {
  const path: string[] = [];
  const walk = (node: Node): boolean => {
    path.push(node.id);
    if (node.quiz_ids.includes(quizId)) return true;
    for (const child of getChildNodes(node.id)) {
      if (walk(child)) return true;
    }
    path.pop();
    return false;
  };
  return walk(root) ? path : [];
}
