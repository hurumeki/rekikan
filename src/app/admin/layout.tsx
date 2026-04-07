import './tailwind.css';
import { AdminStoreProvider } from '@/lib/admin/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <div
        id="admin-root"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '14px',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </AdminStoreProvider>
  );
}
