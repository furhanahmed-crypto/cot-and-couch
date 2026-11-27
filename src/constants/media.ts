/** `gallery` = delivered-home photo, `reel` = short video. */
export const MEDIA_TYPES = ["gallery", "reel"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
