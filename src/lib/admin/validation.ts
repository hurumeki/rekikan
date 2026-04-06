import type { Card, Quiz, Node, Region } from '@/lib/types';
import type { AdminState } from './store';

export interface ValidationError {
  level: 'error' | 'warning';
  entity: string;
  id: string;
  field?: string;
  message: string;
}

export interface ValidationReport {
  errors: ValidationError[];
  warnings: ValidationError[];
  valid: boolean;
}

const ID_PATTERN = /^[a-zA-Z0-9_]{1,64}$/;

// Regex patterns that suggest a hint reveals ordering information
const ORDER_REVEALING_PATTERNS = [
  /\d+代目/,
  /\d+番目/,
  /第\d+/,
  /最初|最後|初めて|最初の|最後の/,
  /\d{3,4}年/,
  /初代|二代|三代/,
  /最初に|最後に/,
];

export function isHintOrderRevealing(hint: string): boolean {
  return ORDER_REVEALING_PATTERNS.some((p) => p.test(hint));
}

export function validateCard(card: Card, state: Pick<AdminState, 'regions' | 'categories'>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!card.id) errors.push({ level: 'error', entity: 'card', id: card.id ?? '?', field: 'id', message: 'IDは必須です' });
  if (card.id && !ID_PATTERN.test(card.id)) errors.push({ level: 'error', entity: 'card', id: card.id, field: 'id', message: 'IDは英数字・アンダースコアのみ（最大64文字）' });
  if (!card.region) errors.push({ level: 'error', entity: 'card', id: card.id, field: 'region', message: 'リージョンは必須です' });
  if (!card.description) errors.push({ level: 'error', entity: 'card', id: card.id, field: 'description', message: '説明文は必須です' });
  if (card.year == null) errors.push({ level: 'error', entity: 'card', id: card.id, field: 'year', message: '年は必須です' });
  if (!card.era_color_key) errors.push({ level: 'error', entity: 'card', id: card.id, field: 'era_color_key', message: '時代帯は必須です' });
  if (!card.status) errors.push({ level: 'error', entity: 'card', id: card.id, field: 'status', message: 'ステータスは必須です' });

  // Term cards require name
  if (card.type === 'term' && !card.name) {
    errors.push({ level: 'error', entity: 'card', id: card.id, field: 'name', message: '用語カードには用語名が必要です' });
  }

  // Region existence
  const regionExists = state.regions.some((r) => r.id === card.region);
  if (card.region && !regionExists) {
    errors.push({ level: 'error', entity: 'card', id: card.id, field: 'region', message: `リージョン "${card.region}" が存在しません` });
  }

  // Era color key existence
  if (card.region && card.era_color_key && regionExists) {
    const region = state.regions.find((r) => r.id === card.region);
    if (region && !region.era_colors[card.era_color_key]) {
      errors.push({ level: 'error', entity: 'card', id: card.id, field: 'era_color_key', message: `時代帯キー "${card.era_color_key}" がリージョン "${card.region}" に存在しません` });
    }
  }

  // Category existence
  if (card.category) {
    const catExists = state.categories.some((c) => c.value === card.category);
    if (!catExists) {
      errors.push({ level: 'error', entity: 'card', id: card.id, field: 'category', message: `カテゴリ "${card.category}" が存在しません` });
    }
  }

  // Hint order-revealing warning
  if (card.hint && isHintOrderRevealing(card.hint)) {
    errors.push({ level: 'warning', entity: 'card', id: card.id, field: 'hint', message: 'ヒントに順序を示す情報が含まれている可能性があります' });
  }

  return errors;
}

function validateQuiz(quiz: Quiz, cards: Card[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  if (!quiz.id) errors.push({ level: 'error', entity: 'quiz', id: quiz.id ?? '?', field: 'id', message: 'IDは必須です' });
  if (quiz.id && !ID_PATTERN.test(quiz.id)) errors.push({ level: 'error', entity: 'quiz', id: quiz.id, field: 'id', message: 'IDは英数字・アンダースコアのみ（最大64文字）' });
  if (!quiz.title) errors.push({ level: 'error', entity: 'quiz', id: quiz.id, field: 'title', message: 'タイトルは必須です' });
  if (!quiz.card_type) errors.push({ level: 'error', entity: 'quiz', id: quiz.id, field: 'card_type', message: 'カードタイプは必須です' });
  if (!quiz.region) errors.push({ level: 'error', entity: 'quiz', id: quiz.id, field: 'region', message: 'リージョンは必須です' });

  // Card existence
  for (const cardId of quiz.card_ids) {
    if (!cardMap.has(cardId)) {
      errors.push({ level: 'error', entity: 'quiz', id: quiz.id, field: 'card_ids', message: `カード "${cardId}" が存在しません` });
    }
  }

  // Card count
  if (quiz.card_ids.length < 5) {
    errors.push({ level: 'warning', entity: 'quiz', id: quiz.id, field: 'card_ids', message: `カード数が少なすぎます（${quiz.card_ids.length}枚、推奨5〜8枚）` });
  } else if (quiz.card_ids.length > 8) {
    errors.push({ level: 'warning', entity: 'quiz', id: quiz.id, field: 'card_ids', message: `カード数が多すぎます（${quiz.card_ids.length}枚、推奨5〜8枚）` });
  }

  // Non-approved cards
  const hasNonApproved = quiz.card_ids.some((id) => {
    const c = cardMap.get(id);
    return c && c.status !== 'approved';
  });
  if (hasNonApproved) {
    errors.push({ level: 'warning', entity: 'quiz', id: quiz.id, field: 'card_ids', message: '未承認のカードが含まれています' });
  }

  return errors;
}

function validateNode(node: Node, nodes: Node[], quizzes: Quiz[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));

  if (!node.id) errors.push({ level: 'error', entity: 'node', id: node.id ?? '?', field: 'id', message: 'IDは必須です' });
  if (node.id && !ID_PATTERN.test(node.id)) errors.push({ level: 'error', entity: 'node', id: node.id, field: 'id', message: 'IDは英数字・アンダースコアのみ（最大64文字）' });
  if (!node.label) errors.push({ level: 'error', entity: 'node', id: node.id, field: 'label', message: 'ラベルは必須です' });
  if (!node.region) errors.push({ level: 'error', entity: 'node', id: node.id, field: 'region', message: 'リージョンは必須です' });

  // Parent existence
  if (node.parent_id && !nodeMap.has(node.parent_id)) {
    errors.push({ level: 'error', entity: 'node', id: node.id, field: 'parent_id', message: `親ノード "${node.parent_id}" が存在しません` });
  }

  // Quiz existence
  for (const quizId of node.quiz_ids) {
    if (!quizMap.has(quizId)) {
      errors.push({ level: 'error', entity: 'node', id: node.id, field: 'quiz_ids', message: `クイズ "${quizId}" が存在しません` });
    }
  }

  return errors;
}

export function validateImport(data: unknown): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push({ level: 'error', entity: 'root', id: 'root', message: '有効なJSONオブジェクトではありません' });
    return { errors, warnings, valid: false };
  }

  const d = data as Record<string, unknown>;

  // Version check
  if (!d.version) {
    warnings.push({ level: 'warning', entity: 'root', id: 'root', field: 'version', message: 'バージョンフィールドがありません' });
  }

  // Required arrays
  const required = ['regions', 'cards', 'quizzes', 'nodes'] as const;
  for (const key of required) {
    if (!Array.isArray(d[key])) {
      errors.push({ level: 'error', entity: 'root', id: 'root', field: key, message: `"${key}" フィールドが配列ではありません` });
    }
  }

  if (errors.length > 0) return { errors, warnings, valid: false };

  const regions = d.regions as Region[];
  const cards = d.cards as Card[];
  const quizzes = d.quizzes as Quiz[];
  const nodes = d.nodes as Node[];

  const fakeState = {
    regions,
    categories: Array.isArray(d.categories)
      ? (d.categories as { value: string; label: string; icon: string }[])
      : [],
  };

  // Validate each card
  const cardIds = new Set<string>();
  for (const card of cards) {
    const errs = validateCard(card, fakeState as AdminState);
    for (const e of errs) {
      if (e.level === 'error') errors.push(e);
      else warnings.push(e);
    }
    if (card.id) {
      if (cardIds.has(card.id)) {
        errors.push({ level: 'error', entity: 'card', id: card.id, message: `カードID "${card.id}" が重複しています` });
      }
      cardIds.add(card.id);
    }
  }

  // Validate each quiz
  const quizIds = new Set<string>();
  for (const quiz of quizzes) {
    const errs = validateQuiz(quiz, cards);
    for (const e of errs) {
      if (e.level === 'error') errors.push(e);
      else warnings.push(e);
    }
    if (quiz.id) {
      if (quizIds.has(quiz.id)) {
        errors.push({ level: 'error', entity: 'quiz', id: quiz.id, message: `クイズID "${quiz.id}" が重複しています` });
      }
      quizIds.add(quiz.id);
    }
  }

  // Validate each node
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    const errs = validateNode(node, nodes, quizzes);
    for (const e of errs) {
      if (e.level === 'error') errors.push(e);
      else warnings.push(e);
    }
    if (node.id) {
      if (nodeIds.has(node.id)) {
        errors.push({ level: 'error', entity: 'node', id: node.id, message: `ノードID "${node.id}" が重複しています` });
      }
      nodeIds.add(node.id);
    }
  }

  return {
    errors,
    warnings,
    valid: errors.length === 0,
  };
}
