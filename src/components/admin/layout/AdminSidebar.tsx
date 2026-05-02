'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/admin-utils';
import { LayoutList, GitBranch, Database, X } from 'lucide-react';

export type AdminTab = 'cards' | 'tree' | 'master';

interface Props {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

const tabs: { id: AdminTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cards', label: 'カード管理', Icon: LayoutList },
  { id: 'tree', label: 'ツリー・クイズ', Icon: GitBranch },
  { id: 'master', label: 'マスタデータ', Icon: Database },
];

export function AdminSidebar({ activeTab, onChangeTab, isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSelect = (tab: AdminTab) => {
    onChangeTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="メニューを閉じる"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}
      <aside
        className={cn(
          'w-44 shrink-0 border-r border-border flex flex-col py-2',
          'fixed inset-y-0 left-0 z-40 bg-background transition-transform duration-200 ease-out',
          'md:static md:translate-x-0 md:transition-none md:bg-muted/30',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 pb-2 md:hidden">
          <span className="text-sm font-medium text-muted-foreground">メニュー</span>
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors w-full',
              activeTab === id
                ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </aside>
    </>
  );
}
