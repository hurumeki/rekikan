import type { Card, Node } from './types';

export const CARD_IMAGE_DIR = '/images/cards';
export const NODE_IMAGE_DIR = '/images/nodes';
export const IMAGE_EXTENSION = 'webp';

/**
 * 素の <img src> には next.config.ts の basePath が適用されないため、
 * GitHub Pages のようなサブパス配信では自前で前置する必要がある。
 * next.config.ts と同じ環境変数を参照する。
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** `/images/...` のような絶対パスに basePath を前置する。 */
export function resolvePublicPath(path: string, basePath: string = BASE_PATH): string {
  const normalized = basePath.replace(/\/$/, '');
  return `${normalized}${path}`;
}

export function cardImagePath(cardId: string): string {
  return resolvePublicPath(`${CARD_IMAGE_DIR}/${cardId}.${IMAGE_EXTENSION}`);
}

export function nodeCoverImagePath(nodeId: string): string {
  return resolvePublicPath(`${NODE_IMAGE_DIR}/${nodeId}.${IMAGE_EXTENSION}`);
}

export function getCardImageSrc(card: Pick<Card, 'id' | 'has_image'>): string | null {
  return card.has_image ? cardImagePath(card.id) : null;
}

export function getNodeCoverImageSrc(node: Pick<Node, 'id' | 'has_cover_image'>): string | null {
  return node.has_cover_image ? nodeCoverImagePath(node.id) : null;
}
