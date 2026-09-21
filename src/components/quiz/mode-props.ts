import type { Card, CardResult } from '@/lib/types';

/**
 * どのモードのコンポーネントも受け取る共通の入力。
 * モードを追加するときはこの型から始める。
 */
export interface QuizModeProps {
  cards: Card[];
  /** 時代帯キー → 色。カードの時代帯バーに使う */
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
}

/**
 * 並べ替えを伴うモード（じっくり／チャレンジ／同時代）の入力。
 * 正解順を必要とするのはこれらだけなので、型でも分けておく。
 */
export interface OrderingQuizModeProps extends QuizModeProps {
  /** 正解の並び順（クイズの card_ids） */
  correctOrder: string[];
}
