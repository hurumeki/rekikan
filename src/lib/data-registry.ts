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
import centralasiaCards from '@/data/cards/centralasia.json';
import southeastasiaCards from '@/data/cards/southeastasia.json';
import oceaniaCards from '@/data/cards/oceania.json';
import northamericaCards from '@/data/cards/northamerica.json';
import southamericaCards from '@/data/cards/southamerica.json';

import japanQuizzes from '@/data/quizzes/japan.json';
import europeQuizzes from '@/data/quizzes/europe.json';
import chinaQuizzes from '@/data/quizzes/china.json';
import westasiaQuizzes from '@/data/quizzes/westasia.json';
import southasiaQuizzes from '@/data/quizzes/southasia.json';
import centralasiaQuizzes from '@/data/quizzes/centralasia.json';
import southeastasiaQuizzes from '@/data/quizzes/southeastasia.json';
import oceaniaQuizzes from '@/data/quizzes/oceania.json';
import northamericaQuizzes from '@/data/quizzes/northamerica.json';
import southamericaQuizzes from '@/data/quizzes/southamerica.json';
import worldQuizzes from '@/data/quizzes/world.json';

import japanNodes from '@/data/nodes/japan.json';
import europeNodes from '@/data/nodes/europe.json';
import chinaNodes from '@/data/nodes/china.json';
import westasiaNodes from '@/data/nodes/westasia.json';
import southasiaNodes from '@/data/nodes/southasia.json';
import centralasiaNodes from '@/data/nodes/centralasia.json';
import southeastasiaNodes from '@/data/nodes/southeastasia.json';
import oceaniaNodes from '@/data/nodes/oceania.json';
import northamericaNodes from '@/data/nodes/northamerica.json';
import southamericaNodes from '@/data/nodes/southamerica.json';
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
  {
    id: 'centralasia',
    cards: cast<Card>(centralasiaCards),
    quizzes: cast<Quiz>(centralasiaQuizzes),
    nodes: cast<Node>(centralasiaNodes),
  },
  {
    id: 'southeastasia',
    cards: cast<Card>(southeastasiaCards),
    quizzes: cast<Quiz>(southeastasiaQuizzes),
    nodes: cast<Node>(southeastasiaNodes),
  },
  {
    id: 'oceania',
    cards: cast<Card>(oceaniaCards),
    quizzes: cast<Quiz>(oceaniaQuizzes),
    nodes: cast<Node>(oceaniaNodes),
  },
  {
    id: 'northamerica',
    cards: cast<Card>(northamericaCards),
    quizzes: cast<Quiz>(northamericaQuizzes),
    nodes: cast<Node>(northamericaNodes),
  },
  {
    id: 'southamerica',
    cards: cast<Card>(southamericaCards),
    quizzes: cast<Quiz>(southamericaQuizzes),
    nodes: cast<Node>(southamericaNodes),
  },
  { id: 'world', quizzes: cast<Quiz>(worldQuizzes), nodes: cast<Node>(worldNodes) },
];

export const ALL_CARDS: Card[] = REGION_DATASETS.flatMap((r) => r.cards ?? []);
export const ALL_QUIZZES: Quiz[] = REGION_DATASETS.flatMap((r) => r.quizzes);
export const ALL_NODES: Node[] = REGION_DATASETS.flatMap((r) => r.nodes);
