import type { Card, Node } from './types';

export const CARD_IMAGE_DIR = '/images/cards';
export const NODE_IMAGE_DIR = '/images/nodes';
export const IMAGE_EXTENSION = 'webp';

export function cardImagePath(cardId: string): string {
  return `${CARD_IMAGE_DIR}/${cardId}.${IMAGE_EXTENSION}`;
}

export function nodeCoverImagePath(nodeId: string): string {
  return `${NODE_IMAGE_DIR}/${nodeId}.${IMAGE_EXTENSION}`;
}

export function getCardImageSrc(card: Pick<Card, 'id' | 'has_image'>): string | null {
  return card.has_image ? cardImagePath(card.id) : null;
}

export function getNodeCoverImageSrc(node: Pick<Node, 'id' | 'has_cover_image'>): string | null {
  return node.has_cover_image ? nodeCoverImagePath(node.id) : null;
}
