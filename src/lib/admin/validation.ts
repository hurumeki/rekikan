import type { Card, Quiz, Node, Region } from '@/lib/types';
import type { AdminState } from './store';
import type { CategoryDef } from './categories';
import { detectCircularRefs } from './selectors';

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

export function validateCard(
  card: Card,
  state: Pick<AdminState, 'regions' | 'categories'>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!card.id)
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id ?? '?',
      field: 'id',
      message: 'IDは必須です',
    });
  if (card.id && !ID_PATTERN.test(card.id))
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'id',
      message: 'IDは英数字・アンダースコアのみ（最大64文字）',
    });
  if (!card.region)
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'region',
      message: 'リージョンは必須です',
    });
  if (!card.description)
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'description',
      message: '説明文は必須です',
    });
  if (card.year == null)
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'year',
      message: '年は必須です',
    });
  if (!card.era_color_key)
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'era_color_key',
      message: '時代帯は必須です',
    });
  if (!card.status)
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'status',
      message: 'ステータスは必須です',
    });

  // Term cards require name
  if (card.type === 'term' && !card.name) {
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'name',
      message: '用語カードには用語名が必要です',
    });
  }

  // Region existence
  const regionExists = state.regions.some((r) => r.id === card.region);
  if (card.region && !regionExists) {
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'region',
      message: `リージョン "${card.region}" が存在しません`,
    });
  }

  // Era color key existence
  if (card.region && card.era_color_key && regionExists) {
    const region = state.regions.find((r) => r.id === card.region);
    if (region && !region.era_colors[card.era_color_key]) {
      errors.push({
        level: 'error',
        entity: 'card',
        id: card.id,
        field: 'era_color_key',
        message: `時代帯キー "${card.era_color_key}" がリージョン "${card.region}" に存在しません`,
      });
    }
  }

  // Category existence
  if (card.category) {
    const catExists = state.categories.some((c) => c.value === card.category);
    if (!catExists) {
      errors.push({
        level: 'error',
        entity: 'card',
        id: card.id,
        field: 'category',
        message: `カテゴリ "${card.category}" が存在しません`,
      });
    }
  }

  // Image flag type check
  if (card.has_image !== undefined && typeof card.has_image !== 'boolean') {
    errors.push({
      level: 'error',
      entity: 'card',
      id: card.id,
      field: 'has_image',
      message: 'has_image はブール値で指定してください',
    });
  }

  // Hint order-revealing warning
  if (card.hint && isHintOrderRevealing(card.hint)) {
    errors.push({
      level: 'warning',
      entity: 'card',
      id: card.id,
      field: 'hint',
      message: 'ヒントに順序を示す情報が含まれている可能性があります',
    });
  }

  return errors;
}

function validateQuiz(quiz: Quiz, cards: Card[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  if (!quiz.id)
    errors.push({
      level: 'error',
      entity: 'quiz',
      id: quiz.id ?? '?',
      field: 'id',
      message: 'IDは必須です',
    });
  if (quiz.id && !ID_PATTERN.test(quiz.id))
    errors.push({
      level: 'error',
      entity: 'quiz',
      id: quiz.id,
      field: 'id',
      message: 'IDは英数字・アンダースコアのみ（最大64文字）',
    });
  if (!quiz.title)
    errors.push({
      level: 'error',
      entity: 'quiz',
      id: quiz.id,
      field: 'title',
      message: 'タイトルは必須です',
    });
  if (!quiz.card_type)
    errors.push({
      level: 'error',
      entity: 'quiz',
      id: quiz.id,
      field: 'card_type',
      message: 'カードタイプは必須です',
    });
  if (!quiz.region)
    errors.push({
      level: 'error',
      entity: 'quiz',
      id: quiz.id,
      field: 'region',
      message: 'リージョンは必須です',
    });

  // Card existence and region consistency
  for (const cardId of quiz.card_ids) {
    const card = cardMap.get(cardId);
    if (!card) {
      errors.push({
        level: 'error',
        entity: 'quiz',
        id: quiz.id,
        field: 'card_ids',
        message: `カード "${cardId}" が存在しません`,
      });
    } else if (quiz.region && card.region !== quiz.region) {
      errors.push({
        level: 'warning',
        entity: 'quiz',
        id: quiz.id,
        field: 'card_ids',
        message: `カード "${cardId}" のリージョン(${card.region})がクイズのリージョン(${quiz.region})と異なります`,
      });
    }
  }

  // Card count
  if (quiz.card_ids.length < 5) {
    errors.push({
      level: 'warning',
      entity: 'quiz',
      id: quiz.id,
      field: 'card_ids',
      message: `カード数が少なすぎます（${quiz.card_ids.length}枚、推奨5〜8枚）`,
    });
  } else if (quiz.card_ids.length > 8) {
    errors.push({
      level: 'warning',
      entity: 'quiz',
      id: quiz.id,
      field: 'card_ids',
      message: `カード数が多すぎます（${quiz.card_ids.length}枚、推奨5〜8枚）`,
    });
  }

  // Non-approved cards
  const hasNonApproved = quiz.card_ids.some((id) => {
    const c = cardMap.get(id);
    return c && c.status !== 'approved';
  });
  if (hasNonApproved) {
    errors.push({
      level: 'warning',
      entity: 'quiz',
      id: quiz.id,
      field: 'card_ids',
      message: '未承認のカードが含まれています',
    });
  }

  return errors;
}

function validateNode(node: Node, nodes: Node[], quizzes: Quiz[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));

  if (!node.id)
    errors.push({
      level: 'error',
      entity: 'node',
      id: node.id ?? '?',
      field: 'id',
      message: 'IDは必須です',
    });
  if (node.id && !ID_PATTERN.test(node.id))
    errors.push({
      level: 'error',
      entity: 'node',
      id: node.id,
      field: 'id',
      message: 'IDは英数字・アンダースコアのみ（最大64文字）',
    });
  if (!node.label)
    errors.push({
      level: 'error',
      entity: 'node',
      id: node.id,
      field: 'label',
      message: 'ラベルは必須です',
    });
  if (!node.region)
    errors.push({
      level: 'error',
      entity: 'node',
      id: node.id,
      field: 'region',
      message: 'リージョンは必須です',
    });

  // Parent existence and region consistency
  if (node.parent_id) {
    const parentNode = nodeMap.get(node.parent_id);
    if (!parentNode) {
      errors.push({
        level: 'error',
        entity: 'node',
        id: node.id,
        field: 'parent_id',
        message: `親ノード "${node.parent_id}" が存在しません`,
      });
    } else if (node.region && parentNode.region !== node.region) {
      errors.push({
        level: 'warning',
        entity: 'node',
        id: node.id,
        field: 'parent_id',
        message: `親ノード "${node.parent_id}" のリージョン(${parentNode.region})と異なります`,
      });
    }
  }

  // Cover image flag type check
  if (node.has_cover_image !== undefined && typeof node.has_cover_image !== 'boolean') {
    errors.push({
      level: 'error',
      entity: 'node',
      id: node.id,
      field: 'has_cover_image',
      message: 'has_cover_image はブール値で指定してください',
    });
  }

  // Quiz existence
  for (const quizId of node.quiz_ids) {
    if (!quizMap.has(quizId)) {
      errors.push({
        level: 'error',
        entity: 'node',
        id: node.id,
        field: 'quiz_ids',
        message: `クイズ "${quizId}" が存在しません`,
      });
    }
  }

  return errors;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function looksLikeRegion(v: unknown): boolean {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.label === 'string' &&
    typeof v.emoji === 'string' &&
    typeof v.color === 'string' &&
    isPlainObject(v.era_colors)
  );
}

function looksLikeCard(v: unknown): boolean {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.region === 'string' &&
    (v.type === 'term' || v.type === 'description') &&
    typeof v.description === 'string' &&
    typeof v.year === 'number' &&
    typeof v.era_color_key === 'string'
  );
}

function looksLikeQuiz(v: unknown): boolean {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.region === 'string' &&
    typeof v.title === 'string' &&
    isStringArray(v.card_ids) &&
    Array.isArray(v.modes)
  );
}

function looksLikeNode(v: unknown): boolean {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.region === 'string' &&
    typeof v.label === 'string' &&
    (v.parent_id === null || typeof v.parent_id === 'string') &&
    isStringArray(v.quiz_ids)
  );
}

export interface SanitizedImport {
  regions: Region[];
  cards: Card[];
  quizzes: Quiz[];
  nodes: Node[];
  categories: CategoryDef[];
}

export function validateImport(data: unknown): ValidationReport & { sanitized?: SanitizedImport } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!isPlainObject(data)) {
    errors.push({
      level: 'error',
      entity: 'root',
      id: 'root',
      message: '有効なJSONオブジェクトではありません',
    });
    return { errors, warnings, valid: false };
  }

  const d = data;

  // Version check
  if (!d.version) {
    warnings.push({
      level: 'warning',
      entity: 'root',
      id: 'root',
      field: 'version',
      message: 'バージョンフィールドがありません',
    });
  }

  // Required arrays
  const required = ['regions', 'cards', 'quizzes', 'nodes'] as const;
  for (const key of required) {
    if (!Array.isArray(d[key])) {
      errors.push({
        level: 'error',
        entity: 'root',
        id: 'root',
        field: key,
        message: `"${key}" フィールドが配列ではありません`,
      });
    }
  }

  if (errors.length > 0) return { errors, warnings, valid: false };

  // Element-level shape check before casting. Reject the whole import on
  // first malformed element to avoid downstream crashes.
  const rawRegions = d.regions as unknown[];
  const rawCards = d.cards as unknown[];
  const rawQuizzes = d.quizzes as unknown[];
  const rawNodes = d.nodes as unknown[];

  for (let i = 0; i < rawRegions.length; i++) {
    if (!looksLikeRegion(rawRegions[i])) {
      errors.push({
        level: 'error',
        entity: 'region',
        id: `index_${i}`,
        message: `regions[${i}] のスキーマが不正です`,
      });
    }
  }
  for (let i = 0; i < rawCards.length; i++) {
    if (!looksLikeCard(rawCards[i])) {
      errors.push({
        level: 'error',
        entity: 'card',
        id: `index_${i}`,
        message: `cards[${i}] のスキーマが不正です`,
      });
    }
  }
  for (let i = 0; i < rawQuizzes.length; i++) {
    if (!looksLikeQuiz(rawQuizzes[i])) {
      errors.push({
        level: 'error',
        entity: 'quiz',
        id: `index_${i}`,
        message: `quizzes[${i}] のスキーマが不正です`,
      });
    }
  }
  for (let i = 0; i < rawNodes.length; i++) {
    if (!looksLikeNode(rawNodes[i])) {
      errors.push({
        level: 'error',
        entity: 'node',
        id: `index_${i}`,
        message: `nodes[${i}] のスキーマが不正です`,
      });
    }
  }

  if (errors.length > 0) return { errors, warnings, valid: false };

  const regions = rawRegions as Region[];
  const cards = rawCards as Card[];
  const quizzes = rawQuizzes as Quiz[];
  const nodes = rawNodes as Node[];

  const categories: CategoryDef[] = Array.isArray(d.categories)
    ? ((d.categories as unknown[]).filter(
        (c) =>
          isPlainObject(c) &&
          typeof c.value === 'string' &&
          typeof c.label === 'string' &&
          typeof c.icon === 'string',
      ) as CategoryDef[])
    : [];

  const fakeState = { regions, categories };

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
        errors.push({
          level: 'error',
          entity: 'card',
          id: card.id,
          message: `カードID "${card.id}" が重複しています`,
        });
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
        errors.push({
          level: 'error',
          entity: 'quiz',
          id: quiz.id,
          message: `クイズID "${quiz.id}" が重複しています`,
        });
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
        errors.push({
          level: 'error',
          entity: 'node',
          id: node.id,
          message: `ノードID "${node.id}" が重複しています`,
        });
      }
      nodeIds.add(node.id);
    }
  }

  // Detect circular parent_id chains across nodes — fatal because the tree
  // walker in QuizList would otherwise loop forever.
  const circularNodeIds = detectCircularRefs(nodes);
  for (const id of circularNodeIds) {
    errors.push({
      level: 'error',
      entity: 'node',
      id,
      field: 'parent_id',
      message: `ノード "${id}" の親子関係に循環があります`,
    });
  }

  return {
    errors,
    warnings,
    valid: errors.length === 0,
    sanitized: errors.length === 0 ? { regions, cards, quizzes, nodes, categories } : undefined,
  };
}
