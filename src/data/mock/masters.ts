import type { Brand, Collection, Colour, SizeOption, StoreInfo } from "@/types";

export const colours: Colour[] = [
  { id: "c-teak", name: "Natural Teak", hex: "#B08D57" },
  { id: "c-walnut", name: "Walnut", hex: "#5C4033" },
  { id: "c-honey", name: "Honey", hex: "#C9A66B" },
  { id: "c-espresso", name: "Espresso", hex: "#3C2F2F" },
  { id: "c-ivory", name: "Ivory Fabric", hex: "#F5F0E6" },
  { id: "c-charcoal", name: "Charcoal Fabric", hex: "#36454F" },
  { id: "c-sage", name: "Sage Velvet", hex: "#9CAF88" },
  { id: "c-navy", name: "Navy Leatherette", hex: "#1B2838" },
  { id: "c-cream", name: "Cream Upholstery", hex: "#EDE6D9" },
  { id: "c-white", name: "Warm White", hex: "#F7F7F2" },
];

export const brands: Brand[] = [
  { id: "b-cc", name: "Cot & Couch" },
  { id: "b-sleepwell", name: "Sleepwell" },
  { id: "b-kurlon", name: "Kurlon" },
  { id: "b-springfit", name: "Springfit" },
];

export const collections: Collection[] = [
  {
    id: "col-royal",
    name: "Royal Range",
    slug: "royal-range",
    description: "Hand-finished teak statement pieces for lasting homes.",
    featured: true,
  },
  {
    id: "col-victoria",
    name: "Victoria",
    slug: "victoria",
    description: "Classic silhouettes with carved detailing.",
    featured: true,
  },
  {
    id: "col-everyday",
    name: "Everyday Comfort",
    slug: "everyday-comfort",
    description: "Thoughtful value without compromising craft.",
    featured: false,
  },
  {
    id: "col-work",
    name: "Work Studio",
    slug: "work-studio",
    description: "Desks and tables built for Hyderabad homes.",
    featured: false,
  },
];

export const sizes: SizeOption[] = [
  { id: "s-single-72-36", group: "Single", label: '72 × 36"', lengthIn: 72, widthIn: 36 },
  { id: "s-double-75-48", group: "Double", label: '75 × 48"', lengthIn: 75, widthIn: 48 },
  { id: "s-queen-78-60", group: "Queen", label: '78 × 60"', lengthIn: 78, widthIn: 60 },
  { id: "s-king-78-72", group: "King", label: '78 × 72"', lengthIn: 78, widthIn: 72 },
  { id: "s-king-75-72", group: "King", label: '75 × 72"', lengthIn: 75, widthIn: 72 },
];

export const storeInfo: StoreInfo = {
  name: "Cot & Couch",
  address: "Shop 12, Main Road, Lingampally, Hyderabad, Telangana 500019",
  mapUrl: "https://maps.google.com/?q=Lingampally+Hyderabad",
  timings: "Mon–Sun · 10:00 AM – 9:00 PM",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  privacyNotice:
    "We collect your mobile number, name, and catalogue browsing activity to personalise your showroom experience and respond to Visit Store / Contact requests. Marketing WhatsApp messages are sent only if you opt in. You may withdraw marketing consent anytime at the store or by messaging us.",
};
