'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin-ui/dialog';
import { Button } from '@/components/admin-ui/button';
import { useAdminStore } from '@/lib/admin/store';
import { validateImport, type ValidationReport } from '@/lib/admin/validation';
import type { AdminState } from '@/lib/admin/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: Props) {
  const { dispatch } = useAdminStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [parsed, setParsed] = useState<Partial<Omit<AdminState, 'isDirty' | 'lastSavedAt' | 'undoStack'>> | null>(null);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [fileName, setFileName] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result;
        if (typeof raw !== 'string') {
          throw new Error('ファイルの読み込みに失敗しました');
        }
        const data = JSON.parse(raw);
        const result = validateImport(data);
        setReport(result);
        setParsed(data);
        setWarningAcknowledged(false);
      } catch {
        setReport({
          errors: [{ level: 'error', entity: 'root', id: 'root', message: 'JSONのパースに失敗しました' }],
          warnings: [],
          valid: false,
        });
        setParsed(null);
      }
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!parsed) return;
    if (mode === 'overwrite') {
      dispatch({
        type: 'LOAD_STATE',
        data: parsed as Omit<AdminState, 'isDirty' | 'lastSavedAt' | 'undoStack'>,
      });
    } else {
      dispatch({ type: 'MERGE_STATE', data: parsed });
    }
    onOpenChange(false);
    // Reset
    setReport(null);
    setParsed(null);
    setFileName('');
    setWarningAcknowledged(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  const canImport =
    parsed && report && report.errors.length === 0 && (report.warnings.length === 0 || warningAcknowledged);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>インポート</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">インポートモード</label>
            <div className="space-y-2">
              {(['overwrite', 'merge'] as const).map((m) => (
                <label key={m} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {m === 'overwrite' ? '上書き' : 'マージ'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m === 'overwrite'
                        ? '現在のデータをすべて置き換えます'
                        : '同じIDは上書き、新しいIDは追加します（削除なし）'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">JSONファイルを選択</label>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:text-primary-foreground file:cursor-pointer"
            />
            {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
          </div>
          {report && (
            <div className="space-y-2">
              {report.errors.length > 0 && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                  <p className="text-xs font-semibold text-destructive">エラー ({report.errors.length}件)</p>
                  {report.errors.slice(0, 10).map((e, i) => (
                    <p key={i} className="text-xs text-destructive">
                      [{e.entity}: {e.id}] {e.message}
                    </p>
                  ))}
                  {report.errors.length > 10 && (
                    <p className="text-xs text-destructive">...他{report.errors.length - 10}件</p>
                  )}
                </div>
              )}
              {report.warnings.length > 0 && (
                <div className="rounded-md border border-yellow-300/50 bg-yellow-50 p-3 space-y-1">
                  <p className="text-xs font-semibold text-yellow-700">警告 ({report.warnings.length}件)</p>
                  {report.warnings.slice(0, 5).map((w, i) => (
                    <p key={i} className="text-xs text-yellow-700">
                      [{w.entity}: {w.id}] {w.message}
                    </p>
                  ))}
                  {report.warnings.length > 5 && (
                    <p className="text-xs text-yellow-700">...他{report.warnings.length - 5}件</p>
                  )}
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={warningAcknowledged}
                      onChange={(e) => setWarningAcknowledged(e.target.checked)}
                      className="accent-primary"
                    />
                    <span className="text-xs text-yellow-700">警告を確認しました。このままインポートします。</span>
                  </label>
                </div>
              )}
              {report.errors.length === 0 && report.warnings.length === 0 && (
                <p className="text-xs text-green-600">✓ バリデーション通過</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleImport} disabled={!canImport}>
            インポート実行
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
