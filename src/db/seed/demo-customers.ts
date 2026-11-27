import * as schema from "@/db/schema";
import { DEMO_CUSTOMERS } from "./data/demo";
import { db } from "./db";
import { newId } from "./helpers";
import type { SeededPerson } from "./people";
import type { SeededAddon, SeededVariant } from "./types";

export type DemoCustomerInput = {
  customers: SeededPerson[];
  staffId: string | null;
  /** Products the first customer viewed and shortlisted. */
  shortlistProductIds: string[];
  cartLines: { customerIndex: number; variant: SeededVariant; addons: SeededAddon[] }[];
};

/** A lead per demo customer, with a few events, a shortlist and cart lines. */
export async function seedDemoCustomers(input: DemoCustomerInput) {
  const leads = input.customers.map((customer, index) => ({
    id: newId(),
    profileId: customer.id,
    name: customer.name,
    phone: customer.phone,
    area: DEMO_CUSTOMERS[index].area,
    intent: DEMO_CUSTOMERS[index].intent,
    assignedToId: input.staffId,
    wantsWhatsappOffers: index % 2 === 0,
  }));
  const firstLeadId = leads[0].id;
  const events = [
    ...input.shortlistProductIds.map((productId) => ({ leadId: firstLeadId, type: "view" as const, productId })),
    ...input.shortlistProductIds.map((productId) => ({ leadId: firstLeadId, type: "shortlist" as const, productId })),
    { leadId: firstLeadId, type: "cta" as const, details: { action: "whatsapp" } },
  ];
  const cartItems = input.cartLines.map((line) => ({
    id: newId(),
    profileId: input.customers[line.customerIndex].id,
    variantId: line.variant.id,
  }));
  const cartItemAddons = input.cartLines.flatMap((line, index) =>
    line.addons.map((addon) => ({ cartItemId: cartItems[index].id, addonId: addon.id })),
  );

  await db.batch([
    db.insert(schema.leads).values(leads),
    db.insert(schema.leadEvents).values(events),
    db.insert(schema.shortlistItems).values(
      input.shortlistProductIds.map((productId) => ({ profileId: input.customers[0].id, productId })),
    ),
    db.insert(schema.cartItems).values(cartItems),
    db.insert(schema.cartItemAddons).values(cartItemAddons),
  ]);
}
