// Source: docs/pricelist/mattress-pricelist (demo data from the current site).
// No client mattress sheet yet: every brand and model uses the same prices.

export const MATTRESS_BRANDS = [
  { name: "Wake Fit", slug: "wake-fit" },
  { name: "Sleepwell", slug: "sleepwell" },
  { name: "Livpure Smart", slug: "livpure-smart" },
  { name: "Centuary Mattresses", slug: "centuary-mattresses" },
  { name: "SleepyHug", slug: "sleepyhug" },
  { name: "The Sleep Company", slug: "the-sleep-company" },
] as const;

/** Each brand sells all 5 models. Image: /images/mattresses/<brand>/<model>.jpg */
export const MATTRESS_MODELS = [
  { name: "Ortho Support", slug: "ortho-support", specs: { Purpose: "Pain relief", Comfort: "Firm", Filling: "Coir", Cover: "Cotton" } },
  { name: "Cloud Soft", slug: "cloud-soft", specs: { Purpose: "Sleeping", Comfort: "Soft", Filling: "Polyfoam", Cover: "Polycotton" } },
  { name: "Dual Feel", slug: "dual-feel", specs: { Purpose: "Sleeping", Comfort: "Dual Comfort", Filling: "Cotton", Cover: "Polyester Blend" } },
  { name: "Everyday Medium", slug: "everyday-medium", specs: { Purpose: "Sleeping", Comfort: "Medium", Filling: "Polyfoam", Cover: "Polyester" } },
  { name: "Spine Care", slug: "spine-care", specs: { Purpose: "Pain relief", Comfort: "Firm", Filling: "Coir", Cover: "Cotton" } },
] as const;

export const MATTRESS_SIZES = [
  { sizeLabel: "Single", lengthIn: 72, widthIn: 36 },
  { sizeLabel: "Diwan", lengthIn: 75, widthIn: 48 },
  { sizeLabel: "Queen", lengthIn: 78, widthIn: 60 },
  { sizeLabel: "King", lengthIn: 78, widthIn: 72 },
] as const;
export type MattressSize = (typeof MATTRESS_SIZES)[number]["sizeLabel"];

/** MRP and selling price by size, for 6-inch and 8-inch thickness. */
export const MATTRESS_PRICES: { size: MattressSize; thicknessIn: number; mrp: number; price: number }[] = [
  { size: "Single", thicknessIn: 6, mrp: 12999, price: 9999 },
  { size: "Single", thicknessIn: 8, mrp: 16999, price: 13999 },
  { size: "Diwan", thicknessIn: 6, mrp: 16999, price: 13999 },
  { size: "Diwan", thicknessIn: 8, mrp: 20999, price: 17999 },
  { size: "Queen", thicknessIn: 6, mrp: 24999, price: 19999 },
  { size: "Queen", thicknessIn: 8, mrp: 28999, price: 23999 },
  { size: "King", thicknessIn: 6, mrp: 29999, price: 23999 },
  { size: "King", thicknessIn: 8, mrp: 33999, price: 27999 },
];
