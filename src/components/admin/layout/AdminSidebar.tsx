'use client';

import { cn } from '@/lib/admin-utils';
import { LayoutList, GitBranch, Database } from 'lucide-react';

export type AdminTab = 'cards' | 'tree' | 'master';

interface Props {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
}

const tabs: { id: AdminTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cards', label: 'カード管理', Icon: LayoutList },
  { id: 'tree', label: 'ツリー・クイズ', Icon: GitBranch },
  { id: 'master', label: 'マスタデータ', Icon: Database },
];

export function AdminSidebar({ activeTab, onChangeTab }: Props) {
  return (
    <aside className="w-44 shrink-0 border-r border-border bg-muted/30 flex flex-col py-2">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChangeTab(id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors w-full',
            activeTab === id
              ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </aside>
  );
}
