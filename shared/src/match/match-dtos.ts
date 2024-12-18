import { Item } from "@shared/item/item";
import { StandMatch, UserMatch } from "@shared/match/match";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export type MatchRelevantUserDetails = Pick<UserDetail, "name" | "phone">;

export type MatchRelevantItemDetails = Pick<Item, "id" | "title">;

export type MatchWithDetails = (
  | StandMatch
  | (UserMatch & {
      senderDetails: MatchRelevantUserDetails;
      receiverDetails: MatchRelevantUserDetails;
      blIdToItemMap: Record<string, string>;
    })
) & {
  itemDetails: Record<string, MatchRelevantItemDetails>;
};
