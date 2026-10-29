/**
 * Seed ops / CRM rows after catalogue seed.
 * Collections: only Royal Range + Victoria (per Phase 1 PDF).
 */
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./app-schema";

type Db = NeonHttpDatabase<typeof schema>;

export async function clearOps(db: Db) {
  await db.delete(schema.orderStatusHistory);
  await db.delete(schema.orderLines);
  await db.delete(schema.orders);
  await db.delete(schema.leadEvents);
  await db.delete(schema.leads);
  await db.delete(schema.galleryItems);
  await db.delete(schema.reels);
  await db.delete(schema.productCollections);
  await db.delete(schema.collections);
  await db.delete(schema.storeSettings);
}

export async function seedOps(db: Db) {
  await clearOps(db);

  await db.insert(schema.storeSettings).values({
    name: "Cot & Couch",
    address: "Shop 12, Main Road, Lingampally, Hyderabad, Telangana 500019",
    mapUrl: "https://maps.google.com/?q=Lingampally+Hyderabad",
    timings: "Mon–Sun · 10:00 AM – 9:00 PM",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    privacyNotice:
      "We collect your mobile number, name, and catalogue browsing activity to personalise your showroom experience and respond to Visit Store / Contact requests. Marketing WhatsApp messages are sent only if you opt in. You may withdraw marketing consent anytime at the store or by messaging us.",
  });

  const collectionRows = await db
    .insert(schema.collections)
    .values([
      {
        name: "Royal Range",
        slug: "royal-range",
        description: "Hand-finished teak statement pieces for lasting homes.",
        featured: true,
        sortOrder: 1,
      },
      {
        name: "Victoria",
        slug: "victoria",
        description: "Classic silhouettes with carved detailing.",
        featured: true,
        sortOrder: 2,
      },
    ])
    .returning();
  const colBySlug = Object.fromEntries(collectionRows.map((c) => [c.slug, c]));

  const allProducts = await db.select().from(schema.products);
  const productBySlug = Object.fromEntries(allProducts.map((p) => [p.slug, p]));

  const memberships: { productId: string; collectionId: string }[] = [];
  for (const p of allProducts) {
    // Royal Range: featured house-made cots/sofas
    if (
      p.isFeatured &&
      (p.slug.startsWith("cots-") || p.slug.startsWith("sofas-"))
    ) {
      memberships.push({
        productId: p.id,
        collectionId: colBySlug["royal-range"].id,
      });
      continue;
    }
    // Victoria: carved / regal pieces
    if (
      p.slug.includes("carved") ||
      p.slug.includes("regal") ||
      p.slug.includes("victoria")
    ) {
      memberships.push({
        productId: p.id,
        collectionId: colBySlug.victoria.id,
      });
    }
  }
  if (memberships.length) {
    await db.insert(schema.productCollections).values(memberships);
  }

  const gallerySeeds = [
    {
      image: "/images/mattresses/wake-fit/ortho-support.jpg",
      slug: "wake-fit-ortho-support",
      area: "Miyapur",
      month: "Sep 2026",
      approved: true,
    },
    {
      image: "/images/mattresses/sleepwell/cloud-soft.jpg",
      slug: "sleepwell-cloud-soft",
      area: "Gachibowli",
      month: "Oct 2026",
      approved: true,
    },
    {
      image: "/images/mattresses/the-sleep-company/spine-care.jpg",
      slug: "the-sleep-company-spine-care",
      area: "Lingampally",
      month: "Oct 2026",
      approved: true,
    },
    {
      image: "/images/mattresses/livpure-smart/dual-feel.jpg",
      slug: "livpure-smart-dual-feel",
      area: "Kondapur",
      month: "Aug 2026",
      approved: true,
    },
    {
      image: "/images/mattresses/centuary-mattresses/everyday-medium.jpg",
      slug: "centuary-mattresses-everyday-medium",
      area: "Chandanagar",
      month: "Jul 2026",
      approved: false,
    },
  ];

  await db.insert(schema.galleryItems).values(
    gallerySeeds.map((g, i) => ({
      imageUrl: g.image,
      productId: productBySlug[g.slug]?.id ?? null,
      area: g.area,
      deliveryMonth: g.month,
      approved: g.approved,
      sortOrder: i + 1,
    })),
  );

  await db.insert(schema.reels).values([
    {
      title: "Wake Fit Ortho",
      coverUrl: "/images/mattresses/wake-fit/ortho-support.jpg",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      instagramUrl: "https://www.instagram.com/",
      tags: ["home", "mattresses", "wake-fit-ortho-support"],
      sortOrder: 1,
    },
    {
      title: "Sleepwell Cloud Soft",
      coverUrl: "/images/mattresses/sleepwell/cloud-soft.jpg",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      instagramUrl: "https://www.instagram.com/",
      tags: ["home", "mattresses", "sleepwell-cloud-soft"],
      sortOrder: 2,
    },
    {
      title: "Mattress layers",
      coverUrl: "/images/mattresses/cover.jpg",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      instagramUrl: "https://www.instagram.com/",
      tags: ["mattresses", "home"],
      sortOrder: 3,
    },
    {
      title: "Showroom walkthrough",
      coverUrl: "/images/sofas/cover.jpg",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      instagramUrl: "https://www.instagram.com/",
      tags: ["home"],
      sortOrder: 4,
    },
  ]);

  const ortho = productBySlug["wake-fit-ortho-support"];
  const cloud = productBySlug["sleepwell-cloud-soft"];
  const sofa = allProducts.find((p) => p.slug.startsWith("sofas-"));
  const table = allProducts.find((p) => p.slug.startsWith("computer-tables-"));

  const leadRows = [
    {
      mobile: "9848012345",
      name: "Ananya Reddy",
      area: "Gachibowli",
      firstSeenAt: new Date("2026-10-01"),
      lastSeenAt: new Date("2026-10-15"),
      intent: "hot" as const,
      whatsappOffers: true,
      followUpDone: false,
      events: [
        ...(ortho
          ? [
              { type: "view" as const, productId: ortho.id, at: new Date("2026-10-10") },
              { type: "shortlist" as const, productId: ortho.id, at: new Date("2026-10-12") },
              {
                type: "cta" as const,
                productId: ortho.id,
                at: new Date("2026-10-14T11:00:00Z"),
                payload: { type: "visit_store" },
              },
            ]
          : []),
        ...(cloud
          ? [{ type: "view" as const, productId: cloud.id, at: new Date("2026-10-11") }]
          : []),
      ],
    },
    {
      mobile: "9123456780",
      name: "Karthik Rao",
      area: "Miyapur",
      firstSeenAt: new Date("2026-09-20"),
      lastSeenAt: new Date("2026-10-12"),
      intent: "warm" as const,
      whatsappOffers: false,
      followUpDone: true,
      events: sofa
        ? [
            { type: "view" as const, productId: sofa.id, at: new Date("2026-10-11") },
            { type: "shortlist" as const, productId: sofa.id, at: new Date("2026-10-12") },
            {
              type: "cta" as const,
              productId: sofa.id,
              at: new Date("2026-10-12T16:00:00Z"),
              payload: { type: "call" },
            },
          ]
        : [],
    },
    {
      mobile: "9988776655",
      name: "Sneha Patil",
      area: "Lingampally",
      firstSeenAt: new Date("2026-10-10"),
      lastSeenAt: new Date("2026-10-11"),
      intent: "cold" as const,
      whatsappOffers: true,
      followUpDone: false,
      events: table
        ? [{ type: "view" as const, productId: table.id, at: new Date("2026-10-10") }]
        : [],
    },
  ];

  for (const row of leadRows) {
    const { events, ...lead } = row;
    const [inserted] = await db.insert(schema.leads).values(lead).returning();
    if (events.length) {
      await db.insert(schema.leadEvents).values(
        events.map((e) => ({
          leadId: inserted.id,
          eventType: e.type,
          productId: e.productId,
          payload: "payload" in e ? e.payload : {},
          occurredAt: e.at,
        })),
      );
    }
  }

  const orthoVariant = ortho
    ? (
        await db
          .select()
          .from(schema.productVariants)
          .where(eq(schema.productVariants.productId, ortho.id))
          .limit(1)
      )[0]
    : null;

  if (ortho && orthoVariant) {
    const [order] = await db
      .insert(schema.orders)
      .values({
        customerMobile: "9848012345",
        customerName: "Ananya Reddy",
        address: "Flat 402, Gachibowli",
        subtotal: "72000",
        advancePaid: "20000",
        expectedDelivery: "2026-10-25",
        status: "in_production",
      })
      .returning();

    await db.insert(schema.orderLines).values({
      orderId: order.id,
      productId: ortho.id,
      variantId: orthoVariant.id,
      quantity: 1,
      unitPrice: "72000",
      lineTotal: "72000",
      sortOrder: 0,
    });

    await db.insert(schema.orderStatusHistory).values([
      {
        orderId: order.id,
        status: "confirmed",
        byName: "Ravi",
        at: new Date("2026-10-15T10:00:00Z"),
      },
      {
        orderId: order.id,
        status: "in_production",
        byName: "Ravi",
        at: new Date("2026-10-16T09:00:00Z"),
      },
    ]);
  }
}
