import { z } from "zod";

import { BlDocumentSchema } from "#shared/bl-document/bl-document";
import { MatchMeetingInfoSchema } from "#shared/match/match";

export const CandidateUserMatchSchema = z.object({
  customerA: z.string(),
  customerB: z.string(),
  // Items that are expected to move from A to B
  expectedAToBItems: z.set(z.string()),
  // Items that are expected to move from B to A
  expectedBToAItems: z.set(z.string()),
});
export type CandidateUserMatch = z.infer<typeof CandidateUserMatchSchema>;

export const UserMatchSchema = z
  .object({
    customerA: z.string(),
    customerB: z.string(),
    expectedAToBItems: z.string().array(),
    expectedBToAItems: z.string().array(),

    // unique items which have been received by customerA from anyone
    receivedBlIdsCustomerA: z.string().array(),
    // unique items owned by customerA which have been delivered to anyone
    deliveredBlIdsCustomerA: z.string().array(),

    // unique items which have been received by customerB from anyone
    receivedBlIdsCustomerB: z.string().array(),
    // unique items owned by customerB which have been delivered to anyone
    deliveredBlIdsCustomerB: z.string().array(),

    // if true, disallow handing the items out or in at a stand, only allow match exchange
    itemsLockedToMatch: z.boolean(),
  })
  .merge(MatchMeetingInfoSchema)
  .merge(BlDocumentSchema);
export type UserMatch = z.infer<typeof UserMatchSchema>;
