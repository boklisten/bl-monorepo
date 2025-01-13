import { Item } from "@shared/item/item";
import { StandMatch } from "@shared/match/stand-match";
import { UserMatch } from "@shared/match/user-match";
import { UserDetail } from "@shared/user/user-detail/user-detail";

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
