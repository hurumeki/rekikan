import type { AdminState } from './store';
import type { Region, Card, Quiz, Node, EraColor } from '@/lib/types';

export type ExportScope = 'all' | 'approved_only' | 'by_region';

export interface ExportOptions {
  scope: ExportScope;
  regionId?: string;
}

export interface ExportEraBand {
  region_id: string;
  key: string;
  label: string;
  color: string;
}

export interface ExportFormat {
  version: string;
  exported_at: string;
  meta: {
    regions_count: number;
    cards_count: number;
    quizzes_count: number;
    nodes_count: number;
  };
  regions: Region[];
  era_bands: ExportEraBand[];
  categories: { value: string; label: string; icon: string }[];
  cards: Card[];
  quizzes: Quiz[];
  nodes: Node[];
}

export function buildExport(state: AdminState, opts: ExportOptions): ExportFormat {
  let cards = state.cards;
  let quizzes = state.quizzes;
  let nodes = state.nodes;
  let regions = state.regions;

  if (opts.scope === 'approved_only') {
    cards = cards.filter((c) => c.status === 'approved');
    const approvedIds = new Set(cards.map((c) => c.id));
    quizzes = quizzes
      .map((q) => ({
        ...q,
        card_ids: q.card_ids.filter((id) => approvedIds.has(id)),
      }))
      .filter((q) => q.card_ids.length > 0);
  } else if (opts.scope === 'by_region' && opts.regionId) {
    regions = regions.filter((r) => r.id === opts.regionId);
    cards = cards.filter((c) => c.region === opts.regionId);
    quizzes = quizzes.filter((q) => q.region === opts.regionId);
    nodes = nodes.filter((n) => n.region === opts.regionId);
  }

  // Flatten era_colors into era_bands array
  const era_bands: ExportEraBand[] = [];
  for (const region of regions) {
    for (const [key, value] of Object.entries(region.era_colors)) {
      era_bands.push({
        region_id: region.id,
        key,
        label: (value as EraColor).label,
        color: (value as EraColor).color,
      });
    }
  }

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    meta: {
      regions_count: regions.length,
      cards_count: cards.length,
      quizzes_count: quizzes.length,
      nodes_count: nodes.length,
    },
    regions,
    era_bands,
    categories: state.categories,
    cards,
    quizzes,
    nodes,
  };
}

export function downloadJson(data: ExportFormat, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
