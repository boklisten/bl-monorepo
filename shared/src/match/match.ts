import { BlDocument } from "@shared/bl-document/bl-document";
import { Comment } from "@shared/comment/comment";
import { UserPermission } from "@shared/permission/user-permission";

export enum MatchVariant {
  UserMatch = "UserMatch",
  StandMatch = "StandMatch",
}

export class MatchBase implements BlDocument {
  meetingInfo: {
    location: string;
    date: Date | null;
  };
  orders: string[];

  // Required by BlDocument
  id: string;
  blid?: string;
  lastUpdated?: Date;
  creationTime?: Date;
  comments?: Comment[];
  active?: boolean;
  user?: {
    id: string;
    permission?: UserPermission;
  };
  viewableFor?: string[];
  viewableForPermission?: UserPermission;
  editableFor?: string[];
  archived?: boolean;
  // End BlDocument fields ---

  constructor(handoffInfo: MatchBase["meetingInfo"]) {
    this.meetingInfo = handoffInfo;

    this.id = "";
    this.orders = [];
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
  itemsLockedToMatch = true;
  // when receiver items have overrides, the generated customer items will
  // get the deadline specified in the override instead of using the branch period deadline
  deadlineOverrides: Record<string, string>;

  constructor(
    public sender: string,
    public receiver: string,
    // items which are expected to be handed over from sender to receiver
    public expectedItems: string[],
    meetingInfo: MatchBase["meetingInfo"],
    deadlineOverrides: Record<string, string>,
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
