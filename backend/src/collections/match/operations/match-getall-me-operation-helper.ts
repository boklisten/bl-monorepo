import { SEDbQuery } from "@backend/query/se.db-query";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Item } from "@shared/item/item";
import {
  Match,
  MatchVariant,
  StandMatch,
  UserMatch,
} from "@shared/match/match";
import {
  MatchRelevantItemDetails,
  MatchRelevantUserDetails,
  MatchWithDetails,
} from "@shared/match/match-dtos";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

function selectMatchRelevantUserDetails({
  name,
  phone,
}: UserDetail): MatchRelevantUserDetails {
  return {
    name,
    phone,
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
    Array.from(new Set(itemIds.map(String))).map((itemId) => {
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
  match: Match,
  detailsMap: Map<string, UserDetail>,
  blIdsToItemIdMap: Map<string, string>,
  itemsMap: Map<string, Item>,
): MatchWithDetails {
  if (match._variant === MatchVariant.StandMatch) {
    return {
      ...(JSON.parse(JSON.stringify(match)) as StandMatch),
      itemDetails: mapItemIdsToItemDetails(
        [
          ...match.expectedHandoffItems,
          ...match.expectedPickupItems,
          ...match.receivedItems,
          ...match.deliveredItems,
        ],
        itemsMap,
      ),
    };
  }
  const senderDetails = detailsMap.get(match.sender);
  const receiverDetails = detailsMap.get(match.receiver);

  return {
    ...(JSON.parse(JSON.stringify(match)) as UserMatch),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    senderDetails: selectMatchRelevantUserDetails(senderDetails),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    receiverDetails: selectMatchRelevantUserDetails(receiverDetails),
    blIdToItemMap: mapBlIdsToItemIds(
      [...match.receivedBlIds, ...match.deliveredBlIds],
      blIdsToItemIdMap,
    ),
    itemDetails: mapItemIdsToItemDetails(match.expectedItems, itemsMap),
  };
}

export async function addDetailsToAllMatches(
  matches: Match[],
  userDetailStorage: BlDocumentStorage<UserDetail>,
  itemStorage: BlDocumentStorage<Item>,
  uniqueItemStorage: BlDocumentStorage<UniqueItem>,
): Promise<MatchWithDetails[]> {
  const userIds = Array.from(
    matches.reduce(
      (userIds, match) =>
        match._variant === MatchVariant.UserMatch
          ? new Set([...userIds, match.sender, match.receiver])
          : new Set([...userIds, match.customer]),
      new Set<string>(),
    ),
  );
  const userDetailsMap = new Map(
    await Promise.all(
      userIds.map((id) =>
        userDetailStorage
          .get(id)
          .then((detail): [string, UserDetail] => [id, detail]),
      ),
    ),
  );

  const blIdsToMap = Array.from(
    matches.reduce(
      (blIds, match) =>
        match._variant === MatchVariant.UserMatch
          ? new Set([...blIds, ...match.receivedBlIds, ...match.deliveredBlIds])
          : blIds,
      new Set<string>(),
    ),
  );
  const itemsToMapFromExpectedItems = Array.from(
    matches.reduce(
      (items, match) =>
        match._variant === MatchVariant.UserMatch
          ? new Set([...items, ...match.expectedItems.map(String)])
          : new Set([
              ...items,
              ...match.expectedHandoffItems.map(String),
              ...match.expectedPickupItems.map(String),
            ]),
      new Set<string>(),
    ),
  );
  const blIdsToItemIdMap = new Map(
    await Promise.all(
      blIdsToMap.map((blId) => {
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
  const itemsToMapFromBlIds = Array.from(
    Array.from(blIdsToItemIdMap.values()).reduce(
      (itemIds, itemId) => new Set([...itemIds, itemId]),
      new Set<string>(),
    ),
  );
  const itemsToMap = Array.from(
    new Set([...itemsToMapFromExpectedItems, ...itemsToMapFromBlIds]),
  );
  const itemsMap = new Map(
    (await itemStorage.getMany(itemsToMap)).map((item) => [item.id, item]),
  );

  return matches.map((match) =>
    addDetailsToMatch(match, userDetailsMap, blIdsToItemIdMap, itemsMap),
  );
}
