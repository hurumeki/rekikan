import type { Category } from './types';

export const CATEGORY_ICONS: Record<Category, string> = {
  era: '\u{1F4C5}',
  law: '\u2696\uFE0F',
  war: '\u2694\uFE0F',
  culture: '\u{1F3A8}',
  economy: '\u{1F4B0}',
  person: '\u{1F464}',
  event: '\u{1F4CC}',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  era: '時代',
  law: '政治・法',
  war: '戦・外交',
  culture: '文化・宗教',
  economy: '経済・技術',
  person: '人物',
  event: '出来事',
};

export const RECOMMENDED_CARD_COUNT = { min: 5, max: 8 };
