import { Suspense } from "react";
import { listSizeGroupSlugsAction } from "@/app/admin/masters/actions";
import { AdminGate } from "@/components/admin/admin-gate";
import { MastersManager } from "@/components/admin/masters-manager";
import { PageHeader } from "@/components/admin/page-header";
import { getMasters } from "@/services/catalogue";

export const instant = false;

async function MastersContent() {
  const [{ colours, mattressBrands, collections, sizes }, sizeGroups] =
    await Promise.all([getMasters(), listSizeGroupSlugsAction()]);

  return (
    <MastersManager
      colours={colours}
      brands={mattressBrands}
      collections={collections}
      sizes={sizes}
      sizeGroups={sizeGroups}
    />
  );
}

export default function MastersPage() {
  return (
    <AdminGate title="Masters">
      <div className="space-y-6">
        <PageHeader
          title="Masters"
          description="Colours/finishes, mattress brands, collections, and sizes — full add / edit / remove."
        />
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading masters…</p>
          }
        >
          <MastersContent />
        </Suspense>
      </div>
    </AdminGate>
  );
}
