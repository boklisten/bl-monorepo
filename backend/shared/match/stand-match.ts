import { BlDocument } from "#shared/bl-document/bl-document";
import { MatchMeetingInfo } from "#shared/match/match";

export interface CandidateStandMatch {
  customer: string;
  expectedHandoffItems: Set<string>;
  expectedPickupItems: Set<string>;
}

export interface StandMatch extends BlDocument, MatchMeetingInfo {
  customer: string;
  expectedHandoffItems: string[];
  expectedPickupItems: string[];
  // items the customer has received from stand
  receivedItems: string[];
  // items the customer has handed off to stand
  deliveredItems: string[];
}
