import { BlDocument } from "../bl-document/bl-document";

export enum MatchVariant {
  UserMatch = "UserMatch",
  StandMatch = "StandMatch",
}

export class MatchBase extends BlDocument {
  meetingInfo: {
    location: string;
    date: Date | null;
  };
  orders: string[];
  // active until orders have been generated and fulfilled for all expected items

  constructor(handoffInfo: MatchBase["meetingInfo"]) {
    super();
    this.meetingInfo = handoffInfo;
  }
}

export class UserMatch extends MatchBase {
  _variant: MatchVariant.UserMatch = MatchVariant.UserMatch;
  // unique items owned by sender which have been given to anyone. May differ from receivedBlIds
  // when a book is borrowed and handed over to someone other than the technical owner's match
  deliveredBlIds: string[] = [];
  // unique items which have been received by the receiver from anyone
  receivedBlIds: string[] = [];
  // if true, disallow handing the items out or in at a stand, only allow match exchange
  itemsLockedToMatch: boolean = true;
  // when receiver items have overrides, the generated customer items will
  // get the deadline specified in the override instead of using the branch period deadline
  deadlineOverrides: { [item: string]: string };

  constructor(
    public sender: string,
    public receiver: string,
    // items which are expected to be handed over from sender to receiver
    public expectedItems: string[],
    meetingInfo: MatchBase["meetingInfo"],
    deadlineOverrides: { [item: string]: string },
  ) {
    super(meetingInfo);
    this.deadlineOverrides = deadlineOverrides;
  }
}

export class StandMatch extends MatchBase {
  _variant: MatchVariant.StandMatch = MatchVariant.StandMatch;
  // items the customer has received from stand
  receivedItems: string[] = [];
  // items the customer has handed off to stand
  deliveredItems: string[] = [];

  constructor(
    public customer: string,
    // items which are expected to be handed off to stand
    public expectedHandoffItems: string[],
    // items which are expected to be picked up from stand
    public expectedPickupItems: string[],
    meetingInfo: MatchBase["meetingInfo"],
  ) {
    super(meetingInfo);
  }
}

export type Match = UserMatch | StandMatch;
