import type { AdminState } from './store';
import type { Card, Quiz, Node } from '@/lib/types';

/** Returns a map of cardId → number of quizzes containing it */
export function getCardUsageCount(state: Pick<AdminState, 'quizzes'>): Map<string, number> {
  const map = new Map<string, number>();
  for (const quiz of state.quizzes) {
    for (const cardId of quiz.card_ids) {
      map.set(cardId, (map.get(cardId) ?? 0) + 1);
    }
  }
  return map;
}

/** Returns status summary for a quiz based on its cards' review statuses */
export function getQuizStatusSummary(
  quiz: Quiz,
  cards: Card[]
): 'all_approved' | 'some_reviewed' | 'has_draft' {
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  let hasNonApproved = false;
  let hasDraft = false;
  for (const id of quiz.card_ids) {
    const card = cardMap.get(id);
    if (!card || !card.status || card.status === 'draft' || card.status === 'ai_generated') {
      hasDraft = true;
    } else if (card.status === 'reviewed') {
      hasNonApproved = true;
    }
  }
  if (hasDraft) return 'has_draft';
  if (hasNonApproved) return 'some_reviewed';
  return 'all_approved';
}

/** Builds a parent→children map for a flat nodes array */
export function buildNodeTree(nodes: Node[]): Map<string | null, Node[]> {
  const tree = new Map<string | null, Node[]>();
  for (const node of nodes) {
    const parentId = node.parent_id;
    if (!tree.has(parentId)) tree.set(parentId, []);
    tree.get(parentId)!.push(node);
  }
  // Sort children by sort_order
  for (const children of tree.values()) {
    children.sort((a, b) => a.sort_order - b.sort_order);
  }
  return tree;
}

/** Detects circular references in node parent-child chains. Returns IDs involved. */
export function detectCircularRefs(nodes: Node[]): string[] {
  const parentMap = new Map(nodes.map((n) => [n.id, n.parent_id]));
  const circular: string[] = [];
  for (const node of nodes) {
    const visited = new Set<string>();
    let current: string | null = node.id;
    while (current !== null) {
      if (visited.has(current)) {
        circular.push(node.id);
        break;
      }
      visited.add(current);
      current = parentMap.get(current) ?? null;
    }
  }
  return circular;
}

/** Returns the depth of a node in the tree (root nodes = 0) */
export function getNodeDepth(nodeId: string, nodes: Node[]): number {
  const parentMap = new Map(nodes.map((n) => [n.id, n.parent_id]));
  let depth = 0;
  let current: string | null = nodeId;
  const visited = new Set<string>();
  while (current !== null) {
    const parentId: string | null = parentMap.get(current) ?? null;
    if (parentId === null) break;
    if (visited.has(parentId)) break; // circular, stop
    visited.add(parentId);
    current = parentId;
    depth++;
  }
  return depth;
}
