"use client";

import { Clapperboard, Images } from "lucide-react";
import { AddButton } from "@/components/admin/common/add-button";
import { EmptyState } from "@/components/admin/common/empty-state";
import type { MediaAdminItem } from "@/types/admin-content";
import type { OptionItem } from "@/types/admin-products";
import { GalleryFormDialog } from "./gallery-form-dialog";
import { MediaCard } from "./media-card";
import { ReelFormDialog } from "./reel-form-dialog";

const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

export function GalleryGrid({ photos, products }: { photos: MediaAdminItem[]; products: OptionItem[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton label="Add photo" renderDialog={(open, onOpenChange) => <GalleryFormDialog open={open} onOpenChange={onOpenChange} products={products} />} />
      </div>
      {photos.length ? (
        <div className={GRID}>
          {photos.map((photo, index) => (
            <MediaCard
              key={photo.id}
              item={photo}
              details={[photo.area, photo.deliveryMonth, photo.productName].filter(Boolean).join(" · ")}
              isFirst={index === 0}
              isLast={index === photos.length - 1}
              renderEditDialog={(open, onOpenChange) => <GalleryFormDialog key={`${photo.id}-${open}`} open={open} onOpenChange={onOpenChange} products={products} photo={photo} />}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Images} title="No photos yet" description="Add photos of delivered homes for the home page." />
      )}
    </div>
  );
}

export function ReelsGrid({ reels }: { reels: MediaAdminItem[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton label="Add reel" renderDialog={(open, onOpenChange) => <ReelFormDialog open={open} onOpenChange={onOpenChange} />} />
      </div>
      {reels.length ? (
        <div className={GRID}>
          {reels.map((reel, index) => (
            <MediaCard
              key={reel.id}
              item={reel}
              details={reel.tags.length ? `Tags: ${reel.tags.join(", ")}` : "No tags: not shown anywhere"}
              isFirst={index === 0}
              isLast={index === reels.length - 1}
              renderEditDialog={(open, onOpenChange) => <ReelFormDialog key={`${reel.id}-${open}`} open={open} onOpenChange={onOpenChange} reel={reel} />}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Clapperboard} title="No reels yet" description="Add short videos for the shop." />
      )}
    </div>
  );
}
