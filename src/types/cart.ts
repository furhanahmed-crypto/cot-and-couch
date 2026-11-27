type CartLineAddon = { id: string; name: string; unitPrice: number };

export type CartLine = {
  id: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
  /** False when the variant was deactivated or the product unpublished. */
  isAvailable: boolean;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  variantId: string;
  sku: string;
  sizeLabel: string;
  lengthIn: number | null;
  widthIn: number | null;
  thicknessIn: number | null;
  qualityId: string | null;
  qualityName: string | null;
  colourName: string | null;
  mrp: number | null;
  price: number;
  addons: CartLineAddon[];
  /** Add-ons dropped because they are no longer offered for this line. */
  removedAddonNames: string[];
  unitTotal: number;
  lineTotal: number;
};
