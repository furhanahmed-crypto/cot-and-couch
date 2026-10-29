import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getStoreInfo } from "@/services/ops";

export const instant = false;

export default async function SettingsPage() {
  const store = await getStoreInfo();

  return (
    <AdminGate title="Settings">
      <div className="space-y-6">
        <PageHeader
          title="Store settings"
          description="Contact details and showroom information shown on the storefront."
        />
        <SettingsForm store={store} />
      </div>
    </AdminGate>
  );
}
