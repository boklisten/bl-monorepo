import { ObjectId } from "mongodb";

import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { Item } from "#shared/item";
import {
  MatchRelevantItemDetails,
  MatchRelevantUserDetails,
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "#shared/match/match-dtos";
import { StandMatch } from "#shared/match/stand-match";
import { UserMatch } from "#shared/match/user-match";
import { UserDetail } from "#shared/user-detail";

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

function mapItemIdsToItemDetails(
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

async function addDetailsToUserMatches(
  userMatches: UserMatch[],
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
        BlStorage.UserDetails.get(id).then((detail): [string, UserDetail] => [
          id,
          detail,
        ]),
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
        return BlStorage.UniqueItems.getByQuery(uniqueItemQuery).then(
          (uniqueItems): [string, string] => [blId, uniqueItems[0]?.item ?? ""],
        );
      }),
    ),
  );
  const allItems = Array.from(
    new Set([...items, ...blIdsToItemIdMap.values()]),
  );
  const itemsMap = new Map(
    (await BlStorage.Items.getMany(allItems)).map((item) => [item.id, item]),
  );

  return userMatches.map((userMatch) =>
    addDetailsToMatch(userMatch, userDetailsMap, blIdsToItemIdMap, itemsMap),
  );
}

async function addDetailsToStandMatch(
  standMatch: StandMatch,
): Promise<StandMatchWithDetails> {
  const items = Array.from(
    new Set(
      [
        standMatch.expectedHandoffItems,
        standMatch.expectedPickupItems,
        standMatch.deliveredItems,
        standMatch.receivedItems,
      ].flat(),
    ),
  );

  const itemsMap = new Map(
    (await BlStorage.Items.getMany(items)).map((item) => [item.id, item]),
  );
  return {
    ...standMatch,
    itemDetails: mapItemIdsToItemDetails(items, itemsMap),
  };
}

export async function getMyMatches(detailsId: string) {
  const userMatches = (await BlStorage.UserMatches.aggregate([
    {
      $match: {
        $or: [
          { customerA: new ObjectId(detailsId) },
          { customerB: new ObjectId(detailsId) },
        ],
      },
    },
  ])) as UserMatch[];

  const userMatchesWithDetails = await addDetailsToUserMatches(userMatches);

  const standMatches = (await BlStorage.StandMatches.aggregate([
    {
      $match: {
        customer: new ObjectId(detailsId),
      },
    },
  ])) as StandMatch[];

  const standMatch = standMatches[0];
  const standMatchWithDetails =
    standMatch && (await addDetailsToStandMatch(standMatch));

  return {
    userMatches: userMatchesWithDetails,
    standMatch: standMatchWithDetails,
  };
}
