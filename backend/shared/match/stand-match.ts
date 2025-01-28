import { z } from "zod";

import { BlDocumentSchema } from "#shared/bl-document/bl-document";
import { MatchMeetingInfoSchema } from "#shared/match/match";

export const CandidateStandMatchSchema = z.object({
  customer: z.string(),
  expectedHandoffItems: z.set(z.string()),
  expectedPickupItems: z.set(z.string()),
});
export type CandidateStandMatch = z.infer<typeof CandidateStandMatchSchema>;

export const StandMatchSchema = z
  .object({
    customer: z.string(),
    expectedHandoffItems: z.string().array(),
    expectedPickupItems: z.string().array(),
    // items the customer has received from stand
    receivedItems: z.string().array(),
    // items the customer has handed off to stand
    deliveredItems: z.string().array(),
  })
  .merge(MatchMeetingInfoSchema)
  .merge(BlDocumentSchema);
export type StandMatch = z.infer<typeof StandMatchSchema>;
