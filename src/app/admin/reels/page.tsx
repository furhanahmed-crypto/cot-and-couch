import { PageHeader } from "@/components/admin/page-header";
import { ReelsManager } from "@/components/admin/reels-manager";
import { getReels } from "@/services/ops";

export default async function ReelsPage() {
  const reels = await getReels({ includeHidden: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reels"
        description="Showroom reels — add, show/hide, or remove."
      />
      <ReelsManager items={reels} />
    </div>
  );
}
