/**
 * Single source of truth for which regions ship in the bundle.
 * Add a new region here and it propagates to data-loader, the admin
 * tool's initial state, and static-param generation automatically.
 *
 * 地域定義・ノード・クイズは一覧画面に必要なので静的に読み込む。
 * カードはクイズを開くまで使わないうえ全体の 2/3 を占めるため、
 * 地域単位の動的 import にして必要になったときだけ取りに行く。
 */
import type { Region, Card, Quiz, Node } from '@/lib/types';

import regionsData from '@/data/regions.json';

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
  quizzes: Quiz[];
  nodes: Node[];
}

// Cast through unknown — JSON imports are typed as the inferred shape of the
// literal, which doesn't match our domain types.
const cast = <T>(v: unknown): T[] => v as T[];

export const REGIONS: Region[] = cast<Region>(regionsData);

export const REGION_DATASETS: RegionDataset[] = [
  { id: 'japan', quizzes: cast<Quiz>(japanQuizzes), nodes: cast<Node>(japanNodes) },
  { id: 'europe', quizzes: cast<Quiz>(europeQuizzes), nodes: cast<Node>(europeNodes) },
  { id: 'china', quizzes: cast<Quiz>(chinaQuizzes), nodes: cast<Node>(chinaNodes) },
  { id: 'westasia', quizzes: cast<Quiz>(westasiaQuizzes), nodes: cast<Node>(westasiaNodes) },
  { id: 'southasia', quizzes: cast<Quiz>(southasiaQuizzes), nodes: cast<Node>(southasiaNodes) },
  {
    id: 'centralasia',
    quizzes: cast<Quiz>(centralasiaQuizzes),
    nodes: cast<Node>(centralasiaNodes),
  },
  {
    id: 'southeastasia',
    quizzes: cast<Quiz>(southeastasiaQuizzes),
    nodes: cast<Node>(southeastasiaNodes),
  },
  { id: 'oceania', quizzes: cast<Quiz>(oceaniaQuizzes), nodes: cast<Node>(oceaniaNodes) },
  {
    id: 'northamerica',
    quizzes: cast<Quiz>(northamericaQuizzes),
    nodes: cast<Node>(northamericaNodes),
  },
  {
    id: 'southamerica',
    quizzes: cast<Quiz>(southamericaQuizzes),
    nodes: cast<Node>(southamericaNodes),
  },
  { id: 'world', quizzes: cast<Quiz>(worldQuizzes), nodes: cast<Node>(worldNodes) },
];

export const ALL_QUIZZES: Quiz[] = REGION_DATASETS.flatMap((r) => r.quizzes);
export const ALL_NODES: Node[] = REGION_DATASETS.flatMap((r) => r.nodes);

/**
 * 地域ごとのカード読み込み。呼ばれた地域のチャンクだけが取得される。
 * world はカードを持たない（他地域のカードを参照する）。
 */
export const CARD_LOADERS: Record<string, () => Promise<Card[]>> = {
  japan: () =>
    import('@/data/cards/japan.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  europe: () =>
    import('@/data/cards/europe.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  china: () =>
    import('@/data/cards/china.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  westasia: () =>
    import('@/data/cards/westasia.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  southasia: () =>
    import('@/data/cards/southasia.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  centralasia: () =>
    import('@/data/cards/centralasia.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  southeastasia: () =>
    import('@/data/cards/southeastasia.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  oceania: () =>
    import('@/data/cards/oceania.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  northamerica: () =>
    import('@/data/cards/northamerica.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
  southamerica: () =>
    import('@/data/cards/southamerica.json', { with: { type: 'json' } }).then((m) =>
      cast<Card>(m.default),
    ),
};

export const CARD_REGION_IDS: string[] = Object.keys(CARD_LOADERS);
