import { AdminGate } from "@/components/admin/admin-gate";
import { AttributesManager } from "@/components/admin/attributes-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listOptionGroupsAction } from "@/app/admin/attributes/actions";

export default async function AttributesPage() {
  const groups = await listOptionGroupsAction();

  return (
    <AdminGate title="Attributes">
      <div className="space-y-6">
        <PageHeader
          title="Attribute options"
          description="Option groups and values in Neon (purpose, size, thickness, cover, filling, comfort, colour). Add / edit / remove values here."
        />
        <AttributesManager groups={groups} />
      </div>
    </AdminGate>
  );
}
