'use client';

import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { ExportDialog } from '@/components/admin/import-export/ExportDialog';
import { ImportDialog } from '@/components/admin/import-export/ImportDialog';

export function AdminHeader() {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-2 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-foreground">れきかん 編集ツール</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-1" />
          インポート
        </Button>
        <Button size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-1" />
          エクスポート
        </Button>
      </div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </header>
  );
}
