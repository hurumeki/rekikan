import type { Region, Card, Quiz, Node } from './types';
import { REGIONS, ALL_QUIZZES, ALL_NODES, CARD_LOADERS, CARD_REGION_IDS } from './data-registry';

export const allQuizzes: Quiz[] = ALL_QUIZZES;

const regionMap = new Map<string, Region>(REGIONS.map((r) => [r.id, r]));
const quizMap = new Map<string, Quiz>(ALL_QUIZZES.map((q) => [q.id, q]));
const nodeMap = new Map<string, Node>(ALL_NODES.map((n) => [n.id, n]));

const quizzesByRegion = new Map<string, Quiz[]>();
for (const quiz of ALL_QUIZZES) {
  let list = quizzesByRegion.get(quiz.region);
  if (!list) {
    list = [];
    quizzesByRegion.set(quiz.region, list);
  }
  list.push(quiz);
}

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

/* ------------------------------------------------------------------ *
 * カードの遅延読み込み
 *
 * カードは全データの 2/3 を占めるが、必要になるのはクイズを開いたとき
 * だけなので、地域単位で動的 import する。読み込んだ分は cardMap に
 * 溜めて再利用する。
 * ------------------------------------------------------------------ */

const cardMap = new Map<string, Card>();
const loadedRegions = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

export function getCard(cardId: string): Card | undefined {
  return cardMap.get(cardId);
}

/** 読み込み済みの地域かどうか */
export function isRegionCardsLoaded(regionId: string): boolean {
  return loadedRegions.has(regionId) || !(regionId in CARD_LOADERS);
}

export function loadRegionCards(regionId: string): Promise<void> {
  if (loadedRegions.has(regionId)) return Promise.resolve();
  const loader = CARD_LOADERS[regionId];
  // world など自前のカードを持たない地域
  if (!loader) return Promise.resolve();

  const existing = inFlight.get(regionId);
  if (existing) return existing;

  const promise = loader()
    .then((cards) => {
      for (const card of cards) cardMap.set(card.id, card);
      loadedRegions.add(regionId);
    })
    .finally(() => inFlight.delete(regionId));

  inFlight.set(regionId, promise);
  return promise;
}

export function loadAllCards(): Promise<Card[]> {
  return Promise.all(CARD_REGION_IDS.map(loadRegionCards)).then(() => [...cardMap.values()]);
}

/** クイズに必要な地域のカードを読み込んで、card_ids の順に返す。 */
export async function loadCardsForQuiz(quiz: Quiz): Promise<Card[]> {
  const regions = quiz.regions?.length ? quiz.regions : [quiz.region];
  await Promise.all(regions.map(loadRegionCards));

  let cards = quiz.card_ids.map((id) => cardMap.get(id));
  // regions の指定漏れなどで取りこぼしたら、残りの地域も読んで取り直す
  if (cards.some((c) => c === undefined)) {
    await loadAllCards();
    cards = quiz.card_ids.map((id) => cardMap.get(id));
  }
  return cards.filter((c): c is Card => c !== undefined);
}

/**
 * ID からカードを読み込む。地域が分かっていればその地域だけを読み、
 * 分からないものが残る場合は全地域を読み込む（苦手カード復習用）。
 */
export async function loadCardsByIds(
  cardIds: string[],
  regionHints: string[] = [],
): Promise<Card[]> {
  await Promise.all(regionHints.map(loadRegionCards));

  let cards = cardIds.map((id) => cardMap.get(id));
  if (cards.some((c) => c === undefined)) {
    await loadAllCards();
    cards = cardIds.map((id) => cardMap.get(id));
  }
  return cards.filter((c): c is Card => c !== undefined);
}

export function getQuiz(quizId: string): Quiz | undefined {
  return quizMap.get(quizId);
}

export function getQuizzesForRegion(regionId: string): Quiz[] {
  return quizzesByRegion.get(regionId) ?? [];
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
