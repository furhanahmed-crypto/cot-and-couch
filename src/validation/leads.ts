import { z } from "zod";
import { LEAD_INTENTS } from "@/constants/leads";
import { optionalIdSchema } from "./common";

/** What staff change on a lead: intent, who follows up, and whether they did. */
export const leadUpdateSchema = z.object({
  intent: z.enum(LEAD_INTENTS, { error: "Choose an intent" }),
  assignedToId: optionalIdSchema,
  followUpDone: z.boolean(),
});
export type LeadUpdateInput = z.input<typeof leadUpdateSchema>;
