/**
 * Single source of truth for which regions ship in the bundle.
 * Add a new region here and it propagates to data-loader, the admin
 * tool's initial state, and static-param generation automatically.
 */
import type { Region, Card, Quiz, Node } from '@/lib/types';

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

interface RegionDataset {
  /** Region id, or 'world' for cross-region content with no own cards. */
  id: string;
  cards?: Card[];
  quizzes: Quiz[];
  nodes: Node[];
}

// Cast through unknown — JSON imports are typed as the inferred shape of the
// literal, which doesn't match our domain types.
const cast = <T>(v: unknown): T[] => v as T[];

export const REGIONS: Region[] = cast<Region>(regionsData);

export const REGION_DATASETS: RegionDataset[] = [
  {
    id: 'japan',
    cards: cast<Card>(japanCards),
    quizzes: cast<Quiz>(japanQuizzes),
    nodes: cast<Node>(japanNodes),
  },
  {
    id: 'europe',
    cards: cast<Card>(europeCards),
    quizzes: cast<Quiz>(europeQuizzes),
    nodes: cast<Node>(europeNodes),
  },
  {
    id: 'china',
    cards: cast<Card>(chinaCards),
    quizzes: cast<Quiz>(chinaQuizzes),
    nodes: cast<Node>(chinaNodes),
  },
  {
    id: 'westasia',
    cards: cast<Card>(westasiaCards),
    quizzes: cast<Quiz>(westasiaQuizzes),
    nodes: cast<Node>(westasiaNodes),
  },
  {
    id: 'southasia',
    cards: cast<Card>(southasiaCards),
    quizzes: cast<Quiz>(southasiaQuizzes),
    nodes: cast<Node>(southasiaNodes),
  },
  { id: 'world', quizzes: cast<Quiz>(worldQuizzes), nodes: cast<Node>(worldNodes) },
];

export const ALL_CARDS: Card[] = REGION_DATASETS.flatMap((r) => r.cards ?? []);
export const ALL_QUIZZES: Quiz[] = REGION_DATASETS.flatMap((r) => r.quizzes);
export const ALL_NODES: Node[] = REGION_DATASETS.flatMap((r) => r.nodes);
