import { StandMatch, UserMatch } from "./match";
import { UserDetail } from "../user/user-detail/user-detail";
import { Item } from "../item/item";

export type MatchRelevantUserDetails = Pick<UserDetail, "name" | "phone">;

export type MatchRelevantItemDetails = Pick<Item, "id" | "title">;

export type MatchWithDetails = (
  | StandMatch
  | (UserMatch & {
      senderDetails: MatchRelevantUserDetails;
      receiverDetails: MatchRelevantUserDetails;
      blIdToItemMap: {
        [blId: string]: string;
      };
    })
) & {
  itemDetails: {
    [itemId: string]: MatchRelevantItemDetails;
  };
};
