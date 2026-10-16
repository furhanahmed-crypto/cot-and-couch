import { AdminGate } from "@/components/admin/admin-gate";
import { MastersManager } from "@/components/admin/masters-manager";
import { PageHeader } from "@/components/admin/page-header";
import { getMasters } from "@/services/catalogue";
import { listSizeGroupSlugsAction } from "@/app/admin/masters/actions";

export default async function MastersPage() {
  const [{ colours, mattressBrands, collections, sizes }, sizeGroups] =
    await Promise.all([getMasters(), listSizeGroupSlugsAction()]);

  return (
    <AdminGate title="Masters">
      <div className="space-y-6">
        <PageHeader
          title="Masters"
          description="Colours/finishes (PDF: teak, walnut, honey, natural), mattress brands, collections (Royal Range, Victoria), and sizes — full add / edit / remove."
        />
        <MastersManager
          colours={colours}
          brands={mattressBrands}
          collections={collections}
          sizes={sizes}
          sizeGroups={sizeGroups}
        />
      </div>
    </AdminGate>
  );
}
