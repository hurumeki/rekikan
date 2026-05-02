'use client';

import { useState } from 'react';
import { Download, Menu, Upload } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { ExportDialog } from '@/components/admin/import-export/ExportDialog';
import { ImportDialog } from '@/components/admin/import-export/ImportDialog';

interface Props {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          aria-label="メニューを開く"
          onClick={onMenuClick}
          className="inline-flex h-8 w-8 items-center justify-center rounded text-foreground hover:bg-accent hover:text-accent-foreground md:hidden shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-base md:text-lg font-semibold text-foreground truncate">
          れきかん 編集ツール
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportOpen(true)}
          aria-label="インポート"
        >
          <Upload className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">インポート</span>
        </Button>
        <Button size="sm" onClick={() => setExportOpen(true)} aria-label="エクスポート">
          <Download className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">エクスポート</span>
        </Button>
      </div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </header>
  );
}
