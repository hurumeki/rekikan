'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { AdminSidebar, type AdminTab } from '@/components/admin/layout/AdminSidebar';
import { AdminStatusBar } from '@/components/admin/layout/AdminStatusBar';
import { CardListView } from '@/components/admin/cards/CardListView';
import { TreeView } from '@/components/admin/tree/TreeView';
import { MasterDataView } from '@/components/admin/master/MasterDataView';
import { useAdminStore } from '@/lib/admin/store';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('cards');
  const { dispatch } = useAdminStore();

  // Global Ctrl+Z undo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (!isInput) {
          e.preventDefault();
          dispatch({ type: 'UNDO' });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  return (
    <>
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar activeTab={activeTab} onChangeTab={setActiveTab} />
        <main className="flex-1 overflow-hidden">
          {activeTab === 'cards' && <CardListView />}
          {activeTab === 'tree' && <TreeView />}
          {activeTab === 'master' && <MasterDataView />}
        </main>
      </div>
      <AdminStatusBar />
    </>
  );
}
