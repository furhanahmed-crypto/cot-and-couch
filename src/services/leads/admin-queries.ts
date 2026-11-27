import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { leadEvents, leads, products, profiles } from "@/db/schema";
import { clampPage, getPageOffset, PAGE_SIZE } from "@/lib/list-params";
import { escapeLikePattern } from "@/services/catalogue/product-card-queries";
import { UNASSIGNED, type LeadAdminFilters, type LeadAdminRow, type LeadDetail } from "@/types/admin-leads";
import type { Page } from "@/types/pagination";

const LEAD_EVENTS_SHOWN = 50;
const assignee = alias(profiles, "assignee");
const customer = alias(profiles, "customer");

function buildWhere(filters: LeadAdminFilters): SQL | undefined {
  const pattern = `%${escapeLikePattern(filters.q)}%`;
  const digits = filters.q.replace(/\D/g, "");
  return and(
    filters.q ? or(ilike(leads.name, pattern), digits ? ilike(leads.phone, `%${digits}%`) : undefined) : undefined,
    filters.intent ? eq(leads.intent, filters.intent) : undefined,
    filters.assignedTo === UNASSIGNED ? isNull(leads.assignedToId) : undefined,
    filters.assignedTo && filters.assignedTo !== UNASSIGNED ? eq(leads.assignedToId, filters.assignedTo) : undefined,
    filters.followUp ? eq(leads.followUpDone, filters.followUp === "done") : undefined,
  );
}

const rowFields = {
  id: leads.id, name: leads.name, phone: leads.phone, area: leads.area, intent: leads.intent,
  assignedToName: assignee.name, assignedToEmail: assignee.email, lastSeenAt: leads.lastSeenAt, followUpDone: leads.followUpDone,
};

type LeadQueryRow = Omit<LeadAdminRow, "lastSeenAt"> & { assignedToEmail: string | null; lastSeenAt: Date };

/** Staff without a name are shown by email. */
function toRow({ assignedToEmail, ...row }: LeadQueryRow): LeadAdminRow {
  return { ...row, assignedToName: row.assignedToName ?? assignedToEmail, lastSeenAt: row.lastSeenAt.toISOString() };
}

/** Most recently active first. */
export async function listLeadsForAdmin(filters: LeadAdminFilters): Promise<Page<LeadAdminRow>> {
  const where = buildWhere(filters);
  const [totalRow] = await db.select({ total: count() }).from(leads).where(where);
  const total = totalRow?.total ?? 0;
  const page = clampPage(filters.page, total);
  const rows = await db
    .select(rowFields)
    .from(leads)
    .leftJoin(assignee, eq(assignee.id, leads.assignedToId))
    .where(where)
    .orderBy(desc(leads.lastSeenAt))
    .limit(PAGE_SIZE)
    .offset(getPageOffset(page));
  return { items: rows.map(toRow), total, page, pageSize: PAGE_SIZE };
}

async function listLeadEvents(leadId: string) {
  const rows = await db
    .select({ id: leadEvents.id, type: leadEvents.type, details: leadEvents.details, occurredAt: leadEvents.occurredAt, productName: products.name })
    .from(leadEvents)
    .leftJoin(products, eq(products.id, leadEvents.productId))
    .where(eq(leadEvents.leadId, leadId))
    .orderBy(desc(leadEvents.occurredAt))
    .limit(LEAD_EVENTS_SHOWN);
  return rows.map((row) => ({ ...row, occurredAt: row.occurredAt.toISOString() }));
}

export async function getLeadForAdmin(leadId: string): Promise<LeadDetail | null> {
  const [row] = await db
    .select({
      ...rowFields, email: customer.email, assignedToId: leads.assignedToId,
      wantsWhatsappOffers: leads.wantsWhatsappOffers, firstSeenAt: leads.firstSeenAt,
    })
    .from(leads)
    .leftJoin(assignee, eq(assignee.id, leads.assignedToId))
    .leftJoin(customer, eq(customer.id, leads.profileId))
    .where(eq(leads.id, leadId));
  if (!row) return null;
  const { email, assignedToId, wantsWhatsappOffers, firstSeenAt, ...listRow } = row;
  return {
    ...toRow(listRow),
    email, assignedToId, wantsWhatsappOffers,
    firstSeenAt: firstSeenAt.toISOString(),
    events: await listLeadEvents(leadId),
  };
}
