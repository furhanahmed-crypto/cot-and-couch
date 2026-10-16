import { PageHeader } from "@/components/admin/page-header";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { getGallery } from "@/services/ops";

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Delivery photos — add, approve, or remove."
      />
      <GalleryManager items={gallery} />
    </div>
  );
}
