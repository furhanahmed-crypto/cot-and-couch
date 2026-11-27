/**
 * Fills the database with the client price lists plus dummy people, orders,
 * leads and media. Clears every app table first.
 *
 * Run: bun run db:seed
 */
import { clearAppTables } from "./clear";
import { seedCategoriesAndColours } from "./catalogue";
import { seedCots } from "./cots";
import { WALK_IN_CUSTOMER } from "./data/demo";
import { seedDemoContent } from "./demo-content";
import { seedDemoCustomers } from "./demo-customers";
import { seedDemoOrders } from "./demo-orders";
import { seedMattresses } from "./mattresses";
import { seedPeople } from "./people";
import { seedSofas } from "./sofas";
import type { SeededAddon, SeededVariant } from "./types";

function findVariant(variants: SeededVariant[], sku: string): SeededVariant {
  const variant = variants.find((item) => item.sku === sku);
  if (!variant) throw new Error(`Seed variant not found: ${sku}`);
  return variant;
}

function findAddon(addons: SeededAddon[], name: string): SeededAddon {
  const addon = addons.find((item) => item.name === name);
  if (!addon) throw new Error(`Seed add-on not found: ${name}`);
  return addon;
}

async function seed() {
  console.log("Clearing app tables…");
  await clearAppTables();

  console.log("Seeding catalogue…");
  const { categoryIds, colours } = await seedCategoriesAndColours();
  const cots = await seedCots(categoryIds.cots, colours);
  const sofas = await seedSofas(categoryIds.sofas);
  const mattresses = await seedMattresses(categoryIds.mattresses);

  console.log("Seeding people, orders, leads and media…");
  const { staff, customers } = await seedPeople();
  const staffId = staff[0]?.id ?? null;
  const cotKing = findVariant(cots.variants, "COT-IDEAL-RANGE-KING-75-TEAK");
  const sofaHighBack = findVariant(sofas.variants, "SOFA-LUXURY-HIGH-BACK-3-1-1-3-2");
  const mattressQueen = findVariant(mattresses.variants, "MAT-WAKE-FIT-ORTHO-SUPPORT-QUEEN-6IN");

  await seedDemoContent([cots.productIds.slice(0, 2), [sofas.productIds[1], mattresses.productIds[0]]]);
  await seedDemoCustomers({
    customers,
    staffId,
    shortlistProductIds: [cots.productIds[0], sofas.productIds[1]],
    cartLines: [
      { customerIndex: 0, variant: cotKing, addons: [findAddon(cots.addons, "Hydraulics (extra)")] },
      { customerIndex: 1, variant: mattressQueen, addons: [] },
    ],
  });
  await seedDemoOrders([
    {
      profileId: customers[0].id, customerName: customers[0].name, customerPhone: customers[0].phone ?? "",
      address: "Test address 1, Miyapur, Hyderabad", status: "confirmed", advanceShare: 0.2, staffId,
      lines: [{ variant: cotKing, quantity: 1, addons: [findAddon(cots.addons, "King size (storage)")] }],
    },
    {
      profileId: customers[1].id, customerName: customers[1].name, customerPhone: customers[1].phone ?? "",
      address: "Test address 2, Gachibowli, Hyderabad", status: "in_production", advanceShare: 0.25, staffId,
      lines: [{ variant: sofaHighBack, quantity: 1, addons: [findAddon(sofas.addons, "Add manual recliner")] }],
    },
    {
      profileId: null, customerName: WALK_IN_CUSTOMER.name, customerPhone: WALK_IN_CUSTOMER.phone,
      address: "Test walk-in address, Lingampally, Hyderabad", status: "delivered", advanceShare: 1, staffId,
      lines: [{ variant: mattressQueen, quantity: 2, addons: [] }],
    },
  ]);

  console.log(`Done: ${staff.length} staff, ${customers.length} demo customers.`);
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
