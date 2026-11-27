import { z } from "zod";
import { ORDER_STATUSES } from "@/constants/orders";
import {
  amountSchema,
  idSchema,
  optionalDateSchema,
  optionalIdSchema,
  optionalTextSchema,
  optionalUrlSchema,
  phoneSchema,
  requiredText,
} from "./common";
import { CART_QUANTITY_MAX, customInchesSchema } from "./shop";

const ORDER_ITEMS_MAX = 30;

/** "" from an empty input -> null. */
const optionalInches = z.preprocess((value) => (value === "" || value === undefined ? null : value), customInchesSchema.nullable());

/** One line of a new order. Prices are not sent: the server works them out. */
const orderItemSchema = z
  .object({
    variantId: idSchema,
    quantity: z.coerce
      .number()
      .int({ error: "Quantity must be a whole number" })
      .min(1, { error: "Quantity must be at least 1" })
      .max(CART_QUANTITY_MAX, { error: `Quantity can be at most ${CART_QUANTITY_MAX}` }),
    addonIds: z.array(idSchema).max(20).default([]),
    customLengthIn: optionalInches.default(null),
    customWidthIn: optionalInches.default(null),
  })
  .refine((item) => (item.customLengthIn === null) === (item.customWidthIn === null), {
    error: "Enter both length and width for a custom size",
    path: ["customLengthIn"],
  });

export const newOrderSchema = z.object({
  /** The customer's account, when picked from the search. */
  profileId: optionalIdSchema,
  customerName: requiredText("Customer name"),
  customerPhone: phoneSchema,
  address: requiredText("Address", 500),
  expectedDelivery: optionalDateSchema,
  advancePaid: amountSchema,
  notes: optionalTextSchema,
  items: z
    .array(orderItemSchema)
    .min(1, { error: "Add at least one item" })
    .max(ORDER_ITEMS_MAX, { error: `An order can have at most ${ORDER_ITEMS_MAX} items` }),
});
export type NewOrderInput = z.input<typeof newOrderSchema>;

export const orderStatusChangeSchema = z.object({
  orderId: idSchema,
  status: z.enum(ORDER_STATUSES, { error: "Choose a status" }),
  note: optionalTextSchema,
});
export type OrderStatusChangeInput = z.input<typeof orderStatusChangeSchema>;

/** Fields staff can change after the order is created. */
export const orderDetailsSchema = z.object({
  advancePaid: amountSchema,
  expectedDelivery: optionalDateSchema,
  deliveryPhotoUrl: optionalUrlSchema,
  notes: optionalTextSchema,
});
export type OrderDetailsInput = z.input<typeof orderDetailsSchema>;

export const customerSearchSchema = z.string().trim().min(2, { error: "Type at least 2 letters" }).max(80);
