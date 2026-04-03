import type { Category } from '@/lib/types';
import { CATEGORY_ICONS } from '@/lib/constants';

export default function CategoryIcon({ category }: { category: Category | null }) {
  if (category === null) return null;
  return <span>{CATEGORY_ICONS[category]}</span>;
}
