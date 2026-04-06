'use client';

import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { useAdminStore } from '@/lib/admin/store';
import type { CategoryDef } from '@/lib/admin/categories';
import type { Category } from '@/lib/types';

export function CategoriesTable() {
  const { state, dispatch } = useAdminStore();
  const [editingValues, setEditingValues] = useState<Record<string, CategoryDef>>({});
  const [newCatForm, setNewCatForm] = useState<{ value: string; label: string; icon: string } | null>(null);

  function startEdit(cat: CategoryDef) {
    setEditingValues((prev) => ({ ...prev, [cat.value]: { ...cat } }));
  }

  function saveEdit(value: string) {
    const edit = editingValues[value];
    if (!edit) return;
    dispatch({ type: 'UPSERT_CATEGORY', category: edit });
    setEditingValues((prev) => { const n = { ...prev }; delete n[value]; return n; });
  }

  function cancelEdit(value: string) {
    setEditingValues((prev) => { const n = { ...prev }; delete n[value]; return n; });
  }

  function deleteCategory(value: string) {
    const usedByCards = state.cards.some((c) => c.category === value);
    if (usedByCards) {
      alert(`カテゴリ "${value}" はカードで使用されているため削除できません`);
      return;
    }
    if (!confirm('このカテゴリを削除しますか？')) return;
    dispatch({ type: 'DELETE_CATEGORY', value });
  }

  function saveNew() {
    if (!newCatForm?.value || !newCatForm?.label) { alert('値とラベルは必須です'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(newCatForm.value)) { alert('値は英数字・アンダースコアのみ'); return; }
    if (state.categories.some((c) => c.value === newCatForm.value)) { alert('この値はすでに存在します'); return; }
    dispatch({
      type: 'UPSERT_CATEGORY',
      category: {
        value: newCatForm.value as Category,
        label: newCatForm.label,
        icon: newCatForm.icon ?? '📌',
      },
    });
    setNewCatForm(null);
  }

  return (
    <div className="space-y-2">
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">値</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ラベル</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">アイコン</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {state.categories.map((cat) => {
              const isEditing = !!editingValues[cat.value];
              const edit = editingValues[cat.value];
              return (
                <tr key={cat.value} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-3 py-2 text-xs font-mono">{cat.value}</td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <Input
                        value={edit.label}
                        onChange={(e) => setEditingValues((p) => ({ ...p, [cat.value]: { ...edit, label: e.target.value } }))}
                        className="h-7 text-xs"
                      />
                    ) : (
                      <span className="text-sm">{cat.label}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <Input
                        value={edit.icon}
                        onChange={(e) => setEditingValues((p) => ({ ...p, [cat.value]: { ...edit, icon: e.target.value } }))}
                        className="h-7 text-xs w-16"
                      />
                    ) : (
                      <span className="text-lg">{cat.icon}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => saveEdit(cat.value)}><Save className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => cancelEdit(cat.value)}>✕</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => startEdit(cat)}>編集</Button>
                          <button onClick={() => deleteCategory(cat.value)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {newCatForm ? (
        <div className="border border-primary/30 rounded-md p-3 space-y-2">
          <p className="text-xs font-medium">新規カテゴリ</p>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="値 (英数字)" value={newCatForm.value} onChange={(e) => setNewCatForm((p) => p ? { ...p, value: e.target.value } : p)} className="h-8 text-xs" />
            <Input placeholder="ラベル" value={newCatForm.label} onChange={(e) => setNewCatForm((p) => p ? { ...p, label: e.target.value } : p)} className="h-8 text-xs" />
            <Input placeholder="アイコン絵文字" value={newCatForm.icon} onChange={(e) => setNewCatForm((p) => p ? { ...p, icon: e.target.value } : p)} className="h-8 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveNew}>保存</Button>
            <Button size="sm" variant="outline" onClick={() => setNewCatForm(null)}>キャンセル</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setNewCatForm({ value: '', label: '', icon: '📌' })}>
          <Plus className="h-4 w-4 mr-1" />
          カテゴリを追加
        </Button>
      )}
    </div>
  );
}
