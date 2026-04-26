import type { Region, Card, Quiz, Node } from './types';
import { REGIONS, ALL_CARDS, ALL_QUIZZES, ALL_NODES } from './data-registry';

export const allQuizzes: Quiz[] = ALL_QUIZZES;

const regionMap = new Map<string, Region>(REGIONS.map((r) => [r.id, r]));
const cardMap = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));
const quizMap = new Map<string, Quiz>(ALL_QUIZZES.map((q) => [q.id, q]));
const nodeMap = new Map<string, Node>(ALL_NODES.map((n) => [n.id, n]));

const nodesByRegion = new Map<string, Node[]>();
for (const node of ALL_NODES) {
  let list = nodesByRegion.get(node.region);
  if (!list) {
    list = [];
    nodesByRegion.set(node.region, list);
  }
  list.push(node);
}

const childrenByParent = new Map<string | null, Node[]>();
for (const node of ALL_NODES) {
  let list = childrenByParent.get(node.parent_id);
  if (!list) {
    list = [];
    childrenByParent.set(node.parent_id, list);
  }
  list.push(node);
}
for (const list of childrenByParent.values()) {
  list.sort((a, b) => a.sort_order - b.sort_order);
}

const rootByRegion = new Map<string, Node>();
for (const node of ALL_NODES) {
  if (node.parent_id === null && !rootByRegion.has(node.region)) {
    rootByRegion.set(node.region, node);
  }
}

export function getRegions(): Region[] {
  return REGIONS;
}

export function getRegion(regionId: string): Region | undefined {
  return regionMap.get(regionId);
}

export function getCard(cardId: string): Card | undefined {
  return cardMap.get(cardId);
}

export function getCardsForQuiz(quiz: Quiz): Card[] {
  return quiz.card_ids.map((id) => cardMap.get(id)).filter((c): c is Card => c !== undefined);
}

export function getQuiz(quizId: string): Quiz | undefined {
  return quizMap.get(quizId);
}

export function getNodesForRegion(regionId: string): Node[] {
  return nodesByRegion.get(regionId) ?? [];
}

export function getRootNode(regionId: string): Node | undefined {
  return rootByRegion.get(regionId);
}

export function getNode(nodeId: string): Node | undefined {
  return nodeMap.get(nodeId);
}

export function getChildNodes(parentId: string): Node[] {
  return childrenByParent.get(parentId) ?? [];
}
