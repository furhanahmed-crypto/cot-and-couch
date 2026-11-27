import { and, asc, eq, max } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { media } from "@/db/schema";
import type { MediaType } from "@/constants/media";
import { AppError } from "@/lib/action-result";
import type { galleryFormSchema, reelFormSchema } from "@/validation/media";

type GalleryData = z.output<typeof galleryFormSchema>;
type ReelData = z.output<typeof reelFormSchema>;

/** New items go to the end of their list. */
async function nextSortOrder(type: MediaType): Promise<number> {
  const [row] = await db.select({ last: max(media.sortOrder) }).from(media).where(eq(media.type, type));
  return (row?.last ?? 0) + 1;
}

async function updateMediaRow(id: string, type: MediaType, changes: Partial<typeof media.$inferInsert>): Promise<void> {
  const updated = await db.update(media).set(changes).where(and(eq(media.id, id), eq(media.type, type))).returning({ id: media.id });
  if (!updated.length) throw new AppError("This item no longer exists");
}

export async function createGalleryPhoto(data: GalleryData): Promise<void> {
  await db.insert(media).values({ ...data, type: "gallery", sortOrder: await nextSortOrder("gallery") });
}

export async function updateGalleryPhoto(id: string, data: GalleryData): Promise<void> {
  await updateMediaRow(id, "gallery", data);
}

export async function createReel(data: ReelData): Promise<void> {
  await db.insert(media).values({ ...data, type: "reel", sortOrder: await nextSortOrder("reel") });
}

export async function updateReel(id: string, data: ReelData): Promise<void> {
  await updateMediaRow(id, "reel", data);
}

export async function setMediaPublished(id: string, isPublished: boolean): Promise<void> {
  const updated = await db.update(media).set({ isPublished }).where(eq(media.id, id)).returning({ id: media.id });
  if (!updated.length) throw new AppError("This item no longer exists");
}

/** Swaps the item with its neighbour, then renumbers the list 1, 2, 3… in one transaction. */
export async function moveMedia(id: string, direction: "up" | "down"): Promise<void> {
  const [item] = await db.select({ type: media.type }).from(media).where(eq(media.id, id));
  if (!item) throw new AppError("This item no longer exists");
  const rows = await db.select({ id: media.id }).from(media).where(eq(media.type, item.type)).orderBy(asc(media.sortOrder), asc(media.createdAt));
  const ids = rows.map((row) => row.id);
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= ids.length) return;
  const reordered = ids.map((current, index) => (index === from ? ids[to]! : index === to ? ids[from]! : current));
  const [first, ...rest] = reordered.map((rowId, index) => db.update(media).set({ sortOrder: index + 1 }).where(eq(media.id, rowId)));
  await db.batch([first!, ...rest]);
}

export async function deleteMedia(id: string): Promise<void> {
  await db.delete(media).where(eq(media.id, id));
}
