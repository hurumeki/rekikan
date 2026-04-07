'use client';

import { RegionsTable } from './RegionsTable';
import { CategoriesTable } from './CategoriesTable';
import { Separator } from '@/components/admin-ui/separator';

export function MasterDataView() {
  return (
    <div className="h-full overflow-auto space-y-6 p-4">
      <section>
        <h3 className="text-sm font-semibold mb-3">リージョン・時代帯</h3>
        <RegionsTable />
      </section>
      <Separator />
      <section>
        <h3 className="text-sm font-semibold mb-3">カテゴリ</h3>
        <CategoriesTable />
      </section>
    </div>
  );
}
