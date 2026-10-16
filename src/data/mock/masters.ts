import type { Collection, StoreInfo } from "@/types";
import { dtoMattressBrands, dtoColours, dtoSizes } from "./catalogue-from-dto";

export const colours = dtoColours;
export const mattressBrands = dtoMattressBrands;
export const sizes = dtoSizes;

/** PDF collections only: Royal Range + Victoria. */
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
