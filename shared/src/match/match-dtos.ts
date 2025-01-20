import { Item } from "@shared/item/item.js";
import { StandMatch } from "@shared/match/stand-match.js";
import { UserMatch } from "@shared/match/user-match.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";

export type MatchRelevantUserDetails = Pick<UserDetail, "name" | "phone">;

export type MatchRelevantItemDetails = Pick<Item, "id" | "title">;

export type UserMatchWithDetails = UserMatch & {
  customerADetails: MatchRelevantUserDetails;
  customerBDetails: MatchRelevantUserDetails;
  blIdToItemMap: Record<string, string>;
  itemDetails: Record<string, MatchRelevantItemDetails>;
};

export type StandMatchWithDetails = StandMatch & {
  itemDetails: Record<string, MatchRelevantItemDetails>;
};
