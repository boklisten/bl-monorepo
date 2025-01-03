import { BlDocumentSchema } from "@shared/bl-document/bl-document";
import { MatchMeetingInfoSchema } from "@shared/match/match";
import { z } from "zod";

const CandidateUserMatchUser = z.object({
  id: z.string(),
  // unique items that this customer is expected to deliver to the other person
  expectedHandoffItems: z.set(z.string()),
  // unique items that this customer is expecting to receive from the other person
  expectedPickupItems: z.set(z.string()),
});

const UserMatchUser = z
  .object({
    // unique items owned by this customer which have been delivered to anyone
    deliveredBlIds: z.string().array(),
    // unique items which have been received by this customer from anyone
    receivedBlIds: z.string().array(),
  })
  .merge(CandidateUserMatchUser);

export const CandidateUserMatchSchema = z.object({
  customerA: CandidateUserMatchUser,
  customerB: CandidateUserMatchUser,
});
export type CandidateUserMatch = z.infer<typeof CandidateUserMatchSchema>;

export const UserMatchSchema = z
  .object({
    customerA: UserMatchUser,
    customerB: UserMatchUser,
    // if true, disallow handing the items out or in at a stand, only allow match exchange
    itemsLockedToMatch: z.boolean(),
  })
  .merge(MatchMeetingInfoSchema)
  .merge(BlDocumentSchema);
export type UserMatch = z.infer<typeof UserMatchSchema>;
