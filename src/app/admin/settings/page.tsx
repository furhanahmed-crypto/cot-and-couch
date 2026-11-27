import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/settings/store-settings-form";
import { requireAdminPage } from "@/services/auth/require-staff";
import { getStoreInfo } from "@/services/settings/queries";

export default async function StoreSettingsPage() {
  await requireAdminPage();
  const storeInfo = await getStoreInfo();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Store" description="The showroom details customers see in the shop." />
      <StoreSettingsForm initial={storeInfo} />
    </div>
  );
}
