// Dummy data for trying the app. Names are clearly fake on purpose.
import type { LeadIntent } from "@/constants/leads";

/** Neon Auth users with these emails get an admin profile. Override with SEED_STAFF_EMAILS. */
export const DEFAULT_STAFF_EMAILS = ["test@cotandcouch.com"];

export const STORE_SETTINGS = {
  name: "Cot & Couch",
  address: "Shop 12, Main Road, Lingampally, Hyderabad, Telangana 500019",
  mapUrl: "https://maps.google.com/?q=Lingampally+Hyderabad",
  timings: "Mon–Sun · 10:00 AM – 9:00 PM",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  privacyNotice:
    "We collect your mobile number, name, and catalogue browsing activity to personalise your showroom experience and respond to Visit Store / Contact requests. Marketing WhatsApp messages are sent only if you opt in. You may withdraw marketing consent anytime at the store or by messaging us.",
};

export const DEMO_CUSTOMERS: { name: string; phone: string; area: string; intent: LeadIntent }[] = [
  { name: "Test Customer 1", phone: "9000000001", area: "Miyapur", intent: "hot" },
  { name: "Test Customer 2", phone: "9000000002", area: "Gachibowli", intent: "warm" },
  { name: "Test Customer 3", phone: "9000000003", area: "Kukatpally", intent: "cold" },
  { name: "Test Customer 4", phone: "9000000004", area: "Lingampally", intent: "cold" },
];

export const WALK_IN_CUSTOMER = { name: "Test Walk-in Customer", phone: "9000000009" };

export const DEMO_COLLECTIONS = [
  { name: "Demo Collection 1", slug: "demo-collection-1", description: "Sample collection for testing.", isFeatured: true },
  { name: "Demo Collection 2", slug: "demo-collection-2", description: "Sample collection for testing.", isFeatured: false },
];

export const DEMO_GALLERY = [
  { imageUrl: "/images/mattresses/wake-fit/ortho-support.jpg", area: "Miyapur", deliveryMonth: "Sep 2026" },
  { imageUrl: "/images/mattresses/sleepwell/cloud-soft.jpg", area: "Gachibowli", deliveryMonth: "Oct 2026" },
  { imageUrl: "/images/mattresses/wake-fit/gallery-2.jpg", area: "Kukatpally", deliveryMonth: "Nov 2026" },
];

export const DEMO_REELS = [
  {
    title: "Demo reel 1",
    imageUrl: "/images/mattresses/wake-fit/ortho-support.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["mattresses"],
  },
  {
    title: "Demo reel 2",
    imageUrl: "/images/mattresses/sleepwell/cloud-soft.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["mattresses"],
  },
];
