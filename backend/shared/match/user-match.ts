import { BlDocument } from "#shared/bl-document";
import { MatchMeetingInfo } from "#shared/match/match";

export interface CandidateUserMatch {
  customerA: string;
  customerB: string;
  /** Items that are expected to move from A to B */
  expectedAToBItems: Set<string>;
  /** Items that are expected to move from B to A */
  expectedBToAItems: Set<string>;
}

export interface UserMatch extends BlDocument, MatchMeetingInfo {
  customerA: string;
  customerB: string;
  expectedAToBItems: string[];
  expectedBToAItems: string[];
  /** unique items which have been received by customerA from anyone */
  receivedBlIdsCustomerA: string[];
  /** unique items owned by customerA which have been delivered to anyone */
  deliveredBlIdsCustomerA: string[];
  /** unique items which have been received by customerB from anyone */
  receivedBlIdsCustomerB: string[];
  /** unique items owned by customerB which have been delivered to anyone */
  deliveredBlIdsCustomerB: string[];
  /** if true, disallow handing the items out or in at a stand, only allow match exchange */
  itemsLockedToMatch: boolean;
}
