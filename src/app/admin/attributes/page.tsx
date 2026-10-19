import { Suspense } from "react";
import { listOptionGroupsAction } from "@/app/admin/attributes/actions";
import { AdminGate } from "@/components/admin/admin-gate";
import { AttributesManager } from "@/components/admin/attributes-manager";
import { PageHeader } from "@/components/admin/page-header";

export const instant = false;

async function AttributesContent() {
  const groups = await listOptionGroupsAction();
  return <AttributesManager groups={groups} />;
}

export default function AttributesPage() {
  return (
    <AdminGate title="Attributes">
      <div className="space-y-6">
        <PageHeader
          title="Attribute options"
          description="Option groups and values in Neon. Add / edit / remove values here."
        />
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading attributes…</p>
          }
        >
          <AttributesContent />
        </Suspense>
      </div>
    </AdminGate>
  );
}
