import type { Region, Card, Quiz, Node } from '@/lib/types';
import type { AdminState } from './store';
import { CATEGORIES } from './categories';

import regionsData from '@/data/regions.json';
import japanCards from '@/data/cards/japan.json';
import europeCards from '@/data/cards/europe.json';
import chinaCards from '@/data/cards/china.json';
import japanQuizzes from '@/data/quizzes/japan.json';
import europeQuizzes from '@/data/quizzes/europe.json';
import chinaQuizzes from '@/data/quizzes/china.json';
import japanNodes from '@/data/nodes/japan.json';
import europeNodes from '@/data/nodes/europe.json';
import chinaNodes from '@/data/nodes/china.json';

export function buildInitialAdminState(): Omit<AdminState, 'isDirty' | 'lastSavedAt' | 'undoStack'> {
  return {
    regions: regionsData as unknown as Region[],
    cards: [...japanCards, ...europeCards, ...chinaCards] as unknown as Card[],
    quizzes: [...japanQuizzes, ...europeQuizzes, ...chinaQuizzes] as unknown as Quiz[],
    nodes: [...japanNodes, ...europeNodes, ...chinaNodes] as unknown as Node[],
    categories: CATEGORIES,
  };
}
