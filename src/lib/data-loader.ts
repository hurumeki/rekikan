import type { Region, Card, Quiz, Node } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typed<T>(data: any): T[] {
  return data as T[];
}

import regionsData from '@/data/regions.json';
import japanCards from '@/data/cards/japan.json';
import europeCards from '@/data/cards/europe.json';
import chinaCards from '@/data/cards/china.json';
import westasiaCards from '@/data/cards/westasia.json';
import southasiaCards from '@/data/cards/southasia.json';
import japanQuizzes from '@/data/quizzes/japan.json';
import europeQuizzes from '@/data/quizzes/europe.json';
import chinaQuizzes from '@/data/quizzes/china.json';
import westasiaQuizzes from '@/data/quizzes/westasia.json';
import southasiaQuizzes from '@/data/quizzes/southasia.json';
import worldQuizzes from '@/data/quizzes/world.json';
import japanNodes from '@/data/nodes/japan.json';
import europeNodes from '@/data/nodes/europe.json';
import chinaNodes from '@/data/nodes/china.json';
import westasiaNodes from '@/data/nodes/westasia.json';
import southasiaNodes from '@/data/nodes/southasia.json';
import worldNodes from '@/data/nodes/world.json';

const regions: Region[] = typed<Region>(regionsData);
const allCards: Card[] = [
  ...typed<Card>(japanCards),
  ...typed<Card>(europeCards),
  ...typed<Card>(chinaCards),
  ...typed<Card>(westasiaCards),
  ...typed<Card>(southasiaCards),
];
export const allQuizzes: Quiz[] = [
  ...typed<Quiz>(japanQuizzes),
  ...typed<Quiz>(europeQuizzes),
  ...typed<Quiz>(chinaQuizzes),
  ...typed<Quiz>(westasiaQuizzes),
  ...typed<Quiz>(southasiaQuizzes),
  ...typed<Quiz>(worldQuizzes),
];
const allNodes: Node[] = [
  ...typed<Node>(japanNodes),
  ...typed<Node>(europeNodes),
  ...typed<Node>(chinaNodes),
  ...typed<Node>(westasiaNodes),
  ...typed<Node>(southasiaNodes),
  ...typed<Node>(worldNodes),
];

const cardMap = new Map<string, Card>(allCards.map((c) => [c.id, c]));
const quizMap = new Map<string, Quiz>(allQuizzes.map((q) => [q.id, q]));

export function getRegions(): Region[] {
  return regions;
}

export function getRegion(regionId: string): Region | undefined {
  return regions.find((r) => r.id === regionId);
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
  return allNodes.filter((n) => n.region === regionId);
}

export function getRootNode(regionId: string): Node | undefined {
  return allNodes.find((n) => n.region === regionId && n.parent_id === null);
}

export function getNode(nodeId: string): Node | undefined {
  return allNodes.find((n) => n.id === nodeId);
}

export function getChildNodes(parentId: string): Node[] {
  return allNodes
    .filter((n) => n.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order);
}
