import { SEDbQuery } from "@backend/query/se.db-query";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Item } from "@shared/item/item";
import {
  MatchRelevantItemDetails,
  MatchRelevantUserDetails,
  UserMatchWithDetails,
} from "@shared/match/match-dtos";
import { UserMatch } from "@shared/match/user-match";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

function selectMatchRelevantUserDetails(
  userDetail?: UserDetail,
): MatchRelevantUserDetails {
  return {
    name: userDetail?.name ?? "",
    phone: userDetail?.phone ?? "",
  };
}

function mapBlIdsToItemIds(
  blIds: string[],
  blIdsToItemIdsMap: Map<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    blIds.map(String).map((blId) => {
      const itemId = blIdsToItemIdsMap.get(blId);
      if (itemId === undefined) {
        throw new BlError(`No uniqueitem with id ${blId} found`);
      }
      return [blId, itemId];
    }),
  );
}

export function mapItemIdsToItemDetails(
  itemIds: string[],
  itemsMap: Map<string, Item>,
): Record<string, MatchRelevantItemDetails> {
  return Object.fromEntries(
    [...new Set(itemIds.map(String))].map((itemId) => {
      const item = itemsMap.get(itemId);
      if (item === undefined) {
        throw new BlError(
          `No item found with id ${itemId} when detailing match`,
        );
      }
      const details: MatchRelevantItemDetails = {
        id: itemId,
        title: item.title,
      };
      return [itemId, details];
    }),
  );
}

function addDetailsToMatch(
  userMatch: UserMatch,
  detailsMap: Map<string, UserDetail>,
  blIdsToItemIdMap: Map<string, string>,
  itemsMap: Map<string, Item>,
): UserMatchWithDetails {
  const customerADetails = detailsMap.get(userMatch.customerA);
  const customerBDetails = detailsMap.get(userMatch.customerB);

  const blIds = Array.from(
    new Set(
      [
        userMatch.deliveredBlIdsCustomerA,
        userMatch.deliveredBlIdsCustomerB,
        userMatch.receivedBlIdsCustomerA,
        userMatch.receivedBlIdsCustomerB,
      ].flat(),
    ),
  );

  return {
    ...userMatch,
    customerADetails: selectMatchRelevantUserDetails(customerADetails),
    customerBDetails: selectMatchRelevantUserDetails(customerBDetails),
    blIdToItemMap: mapBlIdsToItemIds(blIds, blIdsToItemIdMap),
    itemDetails: mapItemIdsToItemDetails(
      [userMatch.expectedAToBItems, userMatch.expectedBToAItems].flat(),
      itemsMap,
    ),
  };
}

export async function addDetailsToUserMatches(
  userMatches: UserMatch[],
  userDetailStorage: BlStorage<UserDetail>,
  itemStorage: BlStorage<Item>,
  uniqueItemStorage: BlStorage<UniqueItem>,
): Promise<UserMatchWithDetails[]> {
  const customers = Array.from(
    new Set(
      userMatches.flatMap((userMatch) => [
        userMatch.customerA,
        userMatch.customerB,
      ]),
    ),
  );
  const userDetailsMap = new Map(
    await Promise.all(
      customers.map((id) =>
        userDetailStorage
          .get(id)
          .then((detail): [string, UserDetail] => [id, detail]),
      ),
    ),
  );

  const blIds = Array.from(
    new Set(
      userMatches.flatMap((userMatch) =>
        [
          userMatch.deliveredBlIdsCustomerA,
          userMatch.deliveredBlIdsCustomerB,
          userMatch.receivedBlIdsCustomerA,
          userMatch.receivedBlIdsCustomerB,
        ].flat(),
      ),
    ),
  );

  const items = Array.from(
    new Set(
      userMatches.flatMap((userMatch) =>
        [userMatch.expectedAToBItems, userMatch.expectedBToAItems].flat(),
      ),
    ),
  );

  const blIdsToItemIdMap = new Map(
    await Promise.all(
      blIds.map((blId) => {
        const uniqueItemQuery = new SEDbQuery();
        uniqueItemQuery.stringFilters = [{ fieldName: "blid", value: blId }];
        return uniqueItemStorage
          .getByQuery(uniqueItemQuery)
          .then((uniqueItems): [string, string] => [
            blId,
            uniqueItems[0]?.item ?? "",
          ]);
      }),
    ),
  );
  const allItems = Array.from(
    new Set([...items, ...blIdsToItemIdMap.values()]),
  );
  const itemsMap = new Map(
    (await itemStorage.getMany(allItems)).map((item) => [item.id, item]),
  );

  return userMatches.map((userMatch) =>
    addDetailsToMatch(userMatch, userDetailsMap, blIdsToItemIdMap, itemsMap),
  );
}
