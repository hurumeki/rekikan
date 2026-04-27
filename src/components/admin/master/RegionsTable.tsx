'use client';

import { Fragment, useState } from 'react';
import { Plus, Save, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin-ui/dialog';
import { useAdminStore } from '@/lib/admin/store';
import type { Region, EraColor } from '@/lib/types';

type EditingRegion = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

type EditingEraBand = {
  key: string;
  label: string;
  color: string;
};

export function RegionsTable() {
  const { state, dispatch } = useAdminStore();
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [editingRegion, setEditingRegion] = useState<Record<string, EditingRegion>>({});
  const [editingEraBands, setEditingEraBands] = useState<
    Record<string, Record<string, EditingEraBand>>
  >({});
  const [newRegionForm, setNewRegionForm] = useState<EditingRegion | null>(null);
  const [eraBandDialog, setEraBandDialog] = useState<{ regionId: string; key: string } | null>(
    null,
  );
  const [eraBandError, setEraBandError] = useState<string>('');

  function toggleExpand(id: string) {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startEditRegion(r: Region) {
    setEditingRegion((prev) => ({
      ...prev,
      [r.id]: { id: r.id, label: r.label, emoji: r.emoji, color: r.color },
    }));
  }

  function saveRegion(regionId: string) {
    const edit = editingRegion[regionId];
    if (!edit) return;
    const region = state.regions.find((r) => r.id === regionId);
    if (!region) return;
    dispatch({ type: 'UPSERT_REGION', region: { ...region, ...edit } });
    setEditingRegion((prev) => {
      const next = { ...prev };
      delete next[regionId];
      return next;
    });
  }

  function deleteRegion(regionId: string) {
    const usedByCards = state.cards.some((c) => c.region === regionId);
    const usedByQuizzes = state.quizzes.some((q) => q.region === regionId);
    const usedByNodes = state.nodes.some((n) => n.region === regionId);
    if (usedByCards || usedByQuizzes || usedByNodes) {
      alert('このリージョンはカード・クイズ・ノードで使用されているため削除できません');
      return;
    }
    if (!confirm('このリージョンを削除しますか？')) return;
    dispatch({ type: 'DELETE_REGION', id: regionId });
  }

  function startEditEraBand(regionId: string, key: string, band: EraColor) {
    setEditingEraBands((prev) => ({
      ...prev,
      [regionId]: {
        ...(prev[regionId] ?? {}),
        [key]: { key, label: band.label, color: band.color },
      },
    }));
  }

  function saveEraBand(regionId: string, key: string) {
    const edit = editingEraBands[regionId]?.[key];
    if (!edit) return;
    const region = state.regions.find((r) => r.id === regionId);
    if (!region) return;
    const newEraColors = { ...region.era_colors, [key]: { label: edit.label, color: edit.color } };
    dispatch({ type: 'UPSERT_REGION', region: { ...region, era_colors: newEraColors } });
    setEditingEraBands((prev) => {
      const next = { ...prev };
      if (next[regionId]) {
        const r = { ...next[regionId] };
        delete r[key];
        next[regionId] = r;
      }
      return next;
    });
  }

  function deleteEraBand(regionId: string, key: string) {
    const usedByCards = state.cards.some((c) => c.region === regionId && c.era_color_key === key);
    if (usedByCards) {
      alert(`時代帯 "${key}" はカードで使用されているため削除できません`);
      return;
    }
    const region = state.regions.find((r) => r.id === regionId);
    if (!region || !confirm('この時代帯を削除しますか？')) return;
    const newEraColors = { ...region.era_colors };
    delete newEraColors[key];
    dispatch({ type: 'UPSERT_REGION', region: { ...region, era_colors: newEraColors } });
  }

  function openAddEraBand(regionId: string) {
    setEraBandDialog({ regionId, key: '' });
    setEraBandError('');
  }

  function confirmAddEraBand() {
    if (!eraBandDialog) return;
    const { regionId, key } = eraBandDialog;
    if (!key || !/^[a-zA-Z0-9_]+$/.test(key)) {
      setEraBandError('英数字・アンダースコアのみで入力してください');
      return;
    }
    const region = state.regions.find((r) => r.id === regionId);
    if (!region) return;
    if (region.era_colors[key]) {
      setEraBandError('このキーはすでに存在します');
      return;
    }
    const newEraColors = { ...region.era_colors, [key]: { label: key, color: '#999999' } };
    dispatch({ type: 'UPSERT_REGION', region: { ...region, era_colors: newEraColors } });
    setEraBandDialog(null);
    setEraBandError('');
  }

  function saveNewRegion() {
    if (!newRegionForm) return;
    if (!newRegionForm.id.trim() || !newRegionForm.label.trim()) {
      alert('IDとラベルは必須です');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newRegionForm.id)) {
      alert('IDは英数字・アンダースコアのみ');
      return;
    }
    if (state.regions.some((r) => r.id === newRegionForm.id)) {
      alert('このIDはすでに存在します');
      return;
    }
    dispatch({
      type: 'UPSERT_REGION',
      region: {
        id: newRegionForm.id,
        label: newRegionForm.label,
        emoji: newRegionForm.emoji || '🌍',
        color: newRegionForm.color || '#999999',
        era_colors: {},
      },
    });
    setNewRegionForm(null);
  }

  return (
    <div className="space-y-2">
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                ラベル
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                絵文字
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                カラー
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {state.regions.map((region) => {
              const isEditing = !!editingRegion[region.id];
              const edit = editingRegion[region.id];
              const isExpanded = expandedRegions.has(region.id);
              return (
                <Fragment key={region.id}>
                  <tr className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleExpand(region.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                        <span className="text-xs font-mono">{region.id}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          value={edit.label}
                          onChange={(e) =>
                            setEditingRegion((p) => ({
                              ...p,
                              [region.id]: { ...edit, label: e.target.value },
                            }))
                          }
                          className="h-7 text-xs"
                        />
                      ) : (
                        <span className="text-sm">{region.label}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          value={edit.emoji}
                          onChange={(e) =>
                            setEditingRegion((p) => ({
                              ...p,
                              [region.id]: { ...edit, emoji: e.target.value },
                            }))
                          }
                          className="h-7 text-xs w-16"
                        />
                      ) : (
                        <span>{region.emoji}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={edit.color}
                            onChange={(e) =>
                              setEditingRegion((p) => ({
                                ...p,
                                [region.id]: { ...edit, color: e.target.value },
                              }))
                            }
                            className="h-7 w-10 rounded border border-border cursor-pointer"
                          />
                          <span className="text-xs font-mono">{edit.color}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className="inline-block h-4 w-4 rounded"
                            style={{ background: region.color }}
                          />
                          <span className="text-xs font-mono">{region.color}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => saveRegion(region.id)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() =>
                                setEditingRegion((p) => {
                                  const n = { ...p };
                                  delete n[region.id];
                                  return n;
                                })
                              }
                            >
                              ✕
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => startEditRegion(region)}
                            >
                              編集
                            </Button>
                            <button
                              onClick={() => deleteRegion(region.id)}
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={5} className="px-0 py-0">
                        <div className="pl-8 pr-4 py-2 space-y-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              時代帯
                            </span>
                            <button
                              onClick={() => openAddEraBand(region.id)}
                              className="text-xs text-primary hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="h-3 w-3" />
                              追加
                            </button>
                          </div>
                          {Object.entries(region.era_colors).map(([key, band]) => {
                            const bandEdit = editingEraBands[region.id]?.[key];
                            const isEditingBand = !!bandEdit;
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-3 py-1 border-b border-border/30 last:border-0"
                              >
                                <span className="text-xs font-mono w-28 shrink-0">{key}</span>
                                {isEditingBand ? (
                                  <>
                                    <Input
                                      value={bandEdit.label}
                                      onChange={(e) =>
                                        setEditingEraBands((p) => ({
                                          ...p,
                                          [region.id]: {
                                            ...p[region.id],
                                            [key]: { ...bandEdit, label: e.target.value },
                                          },
                                        }))
                                      }
                                      className="h-6 text-xs flex-1"
                                    />
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="color"
                                        value={bandEdit.color}
                                        onChange={(e) =>
                                          setEditingEraBands((p) => ({
                                            ...p,
                                            [region.id]: {
                                              ...p[region.id],
                                              [key]: { ...bandEdit, color: e.target.value },
                                            },
                                          }))
                                        }
                                        className="h-6 w-8 rounded border border-border cursor-pointer"
                                      />
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => saveEraBand(region.id, key)}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() =>
                                        setEditingEraBands((p) => {
                                          const n = { ...p };
                                          if (n[region.id]) {
                                            const r2 = { ...n[region.id] };
                                            delete r2[key];
                                            n[region.id] = r2;
                                          }
                                          return n;
                                        })
                                      }
                                    >
                                      ✕
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm flex-1">{band.label}</span>
                                    <div className="flex items-center gap-1">
                                      <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{ background: band.color }}
                                      />
                                      <span className="text-xs font-mono">{band.color}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => startEditEraBand(region.id, key, band)}
                                    >
                                      編集
                                    </Button>
                                    <button
                                      onClick={() => deleteEraBand(region.id, key)}
                                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add new region */}
      {newRegionForm ? (
        <div className="border border-primary/30 rounded-md p-3 space-y-2">
          <p className="text-xs font-medium">新規リージョン</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                placeholder="ID (英数字)"
                value={newRegionForm.id}
                onChange={(e) => setNewRegionForm((p) => (p ? { ...p, id: e.target.value } : p))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                placeholder="ラベル"
                value={newRegionForm.label}
                onChange={(e) => setNewRegionForm((p) => (p ? { ...p, label: e.target.value } : p))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                placeholder="絵文字"
                value={newRegionForm.emoji}
                onChange={(e) => setNewRegionForm((p) => (p ? { ...p, emoji: e.target.value } : p))}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={newRegionForm.color}
                onChange={(e) => setNewRegionForm((p) => (p ? { ...p, color: e.target.value } : p))}
                className="h-8 w-10 rounded border border-border cursor-pointer"
              />
              <span className="text-xs font-mono">{newRegionForm.color}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveNewRegion}>
              保存
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNewRegionForm(null)}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewRegionForm({ id: '', label: '', emoji: '', color: '#999999' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          リージョンを追加
        </Button>
      )}

      <Dialog open={eraBandDialog !== null} onOpenChange={(o) => !o && setEraBandDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>時代帯を追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs text-muted-foreground">キー（英数字・アンダースコア）</label>
            <Input
              autoFocus
              value={eraBandDialog?.key ?? ''}
              onChange={(e) => setEraBandDialog((d) => (d ? { ...d, key: e.target.value } : d))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmAddEraBand();
              }}
              placeholder="例: edo"
            />
            {eraBandError && <p className="text-xs text-destructive">{eraBandError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEraBandDialog(null)}>
              キャンセル
            </Button>
            <Button onClick={confirmAddEraBand}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
