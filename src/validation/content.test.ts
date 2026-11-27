import { describe, expect, it } from "vitest";
import { reelFormSchema } from "./media";
import { storeSettingsSchema } from "./settings";

const reel = { title: "Reel", imageUrl: "/images/a.jpg", videoUrl: "https://example.com/a.mp4", instagramUrl: "", tags: "", isPublished: true };
const store = {
  name: "Cot & Couch", address: "Lingampally", mapUrl: "https://maps.google.com/?q=x", timings: "10–9",
  phone: "+91 98765 43210", whatsapp: "91 98765 43210", privacyNotice: "Notice",
};

describe("reelFormSchema", () => {
  it("turns comma separated tags into a clean list", () => {
    expect(reelFormSchema.parse({ ...reel, tags: " Home, mattresses,,home " }).tags).toEqual(["home", "mattresses"]);
  });

  it("needs an https video link", () => {
    expect(reelFormSchema.safeParse({ ...reel, videoUrl: "http://example.com/a.mp4" }).success).toBe(false);
  });

  it("treats an empty Instagram link as none", () => {
    expect(reelFormSchema.parse(reel).instagramUrl).toBeNull();
  });
});

describe("storeSettingsSchema", () => {
  it("stores WhatsApp as digits only", () => {
    expect(storeSettingsSchema.parse(store).whatsapp).toBe("919876543210");
  });

  it("rejects a WhatsApp number without 91", () => {
    expect(storeSettingsSchema.safeParse({ ...store, whatsapp: "9876543210" }).success).toBe(false);
  });

  it("keeps the phone as typed but checks its digits", () => {
    expect(storeSettingsSchema.parse(store).phone).toBe("+91 98765 43210");
    expect(storeSettingsSchema.safeParse({ ...store, phone: "12345" }).success).toBe(false);
  });
});
