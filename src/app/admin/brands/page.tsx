import { Suspense } from "react";
import { listSizeGroupSlugsAction } from "@/app/admin/brands/actions";
import { AdminGate } from "@/components/admin/admin-gate";
import { BrandsManager } from "@/components/admin/brands-manager";
import { PageHeader } from "@/components/admin/page-header";
import { getMasters } from "@/services/catalogue";

export const instant = false;

async function BrandsContent() {
  const [{ colours, mattressBrands, collections, sizes }, sizeGroups] =
    await Promise.all([getMasters(), listSizeGroupSlugsAction()]);

  return (
    <BrandsManager
      colours={colours}
      brands={mattressBrands}
      collections={collections}
      sizes={sizes}
      sizeGroups={sizeGroups}
    />
  );
}

export default function BrandsPage() {
  return (
    <AdminGate title="Mattress brands">
      <div className="space-y-6">
        <PageHeader
          title="Mattress brands"
          description="Brand defaults and linked catalogue options."
        />
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading brands…</p>
          }
        >
          <BrandsContent />
        </Suspense>
      </div>
    </AdminGate>
  );
}
