export type CardType = 'term' | 'description';
export type Category = 'era' | 'law' | 'war' | 'culture' | 'economy' | 'person' | 'event';
export type GameMode = 'careful' | 'challenge' | 'timeline' | 'era_band' | 'cross_region';
export type ReviewStatus = 'draft' | 'ai_generated' | 'reviewed' | 'approved';
export type CardState = 'unselected' | 'selected' | 'correct' | 'incorrect';

export interface EraColor {
  label: string;
  color: string;
  year_start?: number; // explicit start year for timeline era band display
}

export interface Region {
  id: string;
  label: string;
  emoji: string;
  color: string;
  era_colors: Record<string, EraColor>;
}

export interface Card {
  id: string;
  region: string;
  type: CardType;
  name: string | null;
  year: number;
  year_end: number | null;
  era_color_key: string;
  category: Category | null;
  hint: string | null;
  description: string;
  tags?: string[];
  status?: ReviewStatus;
}

export interface Quiz {
  id: string;
  region: string;
  title: string;
  card_type: CardType;
  card_ids: string[];
  modes: GameMode[];
  difficulty: number;
  regions?: string[] | null;
  timeline_range?: { start: number; end: number };
}

export interface Node {
  id: string;
  region: string;
  parent_id: string | null;
  label: string;
  sort_order: number;
  quiz_ids: string[];
  unlock_condition: UnlockCondition | UnlockCondition[] | null;
}

export type UnlockCondition =
  | { type: 'complete_quizzes'; quiz_ids: string[] }
  | { type: 'complete_node'; node_ids: string[] }
  | { type: 'attempts'; quiz_id: string; count: number }
  | { type: 'hint_clear'; quiz_id: string };

export interface CardResult {
  cardId: string;
  correct: boolean;
  correctPosition: number;
  userPosition: number;
}

export interface QuizResult {
  quizId: string;
  mode: GameMode;
  score: number;
  total: number;
  hintUsed: boolean;
  cardResults: CardResult[];
  timestamp: string;
}

export interface QuizProgress {
  quizId: string;
  bestScore: number;
  cleared: boolean;
  /** Perfect score achieved at least once with hint enabled (used for hint_clear unlock) */
  clearedWithHint: boolean;
  attemptCount: number;
}
