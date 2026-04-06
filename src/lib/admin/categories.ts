import type { Category } from '@/lib/types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants';

export interface CategoryDef {
  value: Category;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = (
  Object.keys(CATEGORY_LABELS) as Category[]
).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
  icon: CATEGORY_ICONS[value],
}));
