"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import {
  createGalleryPhoto,
  createReel,
  deleteMedia,
  moveMedia,
  setMediaPublished,
  updateGalleryPhoto,
  updateReel,
} from "@/services/media/admin-mutations";
import type { ActionResult } from "@/types/action";
import { idSchema } from "@/validation/common";
import {
  galleryFormSchema,
  mediaMoveSchema,
  mediaPublishSchema,
  reelFormSchema,
  type GalleryFormInput,
  type ReelFormInput,
} from "@/validation/media";

function refresh() {
  revalidatePath(ROUTES.admin.media);
  revalidateShopCache();
}

/** Validate, check staff, run, refresh: the same steps for every media action. */
async function runMediaAction<T>(
  schema: z.ZodType<T>,
  input: unknown,
  write: (data: T) => Promise<void>,
  failMessage: string,
): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await write(parsed.data);
  } catch (error) {
    return toActionError(error, failMessage);
  }
  refresh();
  return actionOk();
}

export async function saveGalleryPhotoAction(id: string | null, input: GalleryFormInput): Promise<ActionResult> {
  if (id && !idSchema.safeParse(id).success) return { ok: false, error: "Invalid id" };
  return runMediaAction(galleryFormSchema, input, (data) => (id ? updateGalleryPhoto(id, data) : createGalleryPhoto(data)), "Could not save the photo");
}

export async function saveReelAction(id: string | null, input: ReelFormInput): Promise<ActionResult> {
  if (id && !idSchema.safeParse(id).success) return { ok: false, error: "Invalid id" };
  return runMediaAction(reelFormSchema, input, (data) => (id ? updateReel(id, data) : createReel(data)), "Could not save the reel");
}

export async function setMediaPublishedAction(id: string, isPublished: boolean): Promise<ActionResult> {
  return runMediaAction(mediaPublishSchema, { id, isPublished }, (data) => setMediaPublished(data.id, data.isPublished), "Could not change it");
}

export async function moveMediaAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return runMediaAction(mediaMoveSchema, { id, direction }, (data) => moveMedia(data.id, data.direction), "Could not move it");
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  return runMediaAction(idSchema, id, deleteMedia, "Could not delete it");
}
