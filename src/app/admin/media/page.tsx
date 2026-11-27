import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { UrlTabs } from "@/components/admin/common/url-tabs";
import { GalleryGrid, ReelsGrid } from "@/components/admin/media/media-grids";
import { listMediaForAdmin } from "@/services/media/admin-queries";
import { listPublishedProductOptions } from "@/services/products/filter-options";

export default async function MediaPage() {
  const [photos, reels, products] = await Promise.all([listMediaForAdmin("gallery"), listMediaForAdmin("reel"), listPublishedProductOptions()]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Media" description="Delivered-home photos and reels shown in the shop. The order here is the order in the shop." />
      <UrlTabs
        tabs={[
          { value: "gallery", label: `Gallery (${photos.length})`, content: <GalleryGrid photos={photos} products={products} /> },
          { value: "reels", label: `Reels (${reels.length})`, content: <ReelsGrid reels={reels} /> },
        ]}
      />
    </div>
  );
}
