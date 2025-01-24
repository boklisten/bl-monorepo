import { SEDbQuery } from "@backend/lib/query/se.db-query.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
function selectMatchRelevantUserDetails(userDetail) {
    return {
        name: userDetail?.name ?? "",
        phone: userDetail?.phone ?? "",
    };
}
function mapBlIdsToItemIds(blIds, blIdsToItemIdsMap) {
    return Object.fromEntries(blIds.map(String).map((blId) => {
        const itemId = blIdsToItemIdsMap.get(blId);
        if (itemId === undefined) {
            throw new BlError(`No uniqueitem with id ${blId} found`);
        }
        return [blId, itemId];
    }));
}
export function mapItemIdsToItemDetails(itemIds, itemsMap) {
    return Object.fromEntries([...new Set(itemIds.map(String))].map((itemId) => {
        const item = itemsMap.get(itemId);
        if (item === undefined) {
            throw new BlError(`No item found with id ${itemId} when detailing match`);
        }
        const details = {
            id: itemId,
            title: item.title,
        };
        return [itemId, details];
    }));
}
function addDetailsToMatch(userMatch, detailsMap, blIdsToItemIdMap, itemsMap) {
    const customerADetails = detailsMap.get(userMatch.customerA);
    const customerBDetails = detailsMap.get(userMatch.customerB);
    const blIds = Array.from(new Set([
        userMatch.deliveredBlIdsCustomerA,
        userMatch.deliveredBlIdsCustomerB,
        userMatch.receivedBlIdsCustomerA,
        userMatch.receivedBlIdsCustomerB,
    ].flat()));
    return {
        ...userMatch,
        customerADetails: selectMatchRelevantUserDetails(customerADetails),
        customerBDetails: selectMatchRelevantUserDetails(customerBDetails),
        blIdToItemMap: mapBlIdsToItemIds(blIds, blIdsToItemIdMap),
        itemDetails: mapItemIdsToItemDetails([userMatch.expectedAToBItems, userMatch.expectedBToAItems].flat(), itemsMap),
    };
}
export async function addDetailsToUserMatches(userMatches) {
    const customers = Array.from(new Set(userMatches.flatMap((userMatch) => [
        userMatch.customerA,
        userMatch.customerB,
    ])));
    const userDetailsMap = new Map(await Promise.all(customers.map((id) => BlStorage.UserDetails.get(id).then((detail) => [
        id,
        detail,
    ]))));
    const blIds = Array.from(new Set(userMatches.flatMap((userMatch) => [
        userMatch.deliveredBlIdsCustomerA,
        userMatch.deliveredBlIdsCustomerB,
        userMatch.receivedBlIdsCustomerA,
        userMatch.receivedBlIdsCustomerB,
    ].flat())));
    const items = Array.from(new Set(userMatches.flatMap((userMatch) => [userMatch.expectedAToBItems, userMatch.expectedBToAItems].flat())));
    const blIdsToItemIdMap = new Map(await Promise.all(blIds.map((blId) => {
        const uniqueItemQuery = new SEDbQuery();
        uniqueItemQuery.stringFilters = [{ fieldName: "blid", value: blId }];
        return BlStorage.UniqueItems.getByQuery(uniqueItemQuery).then((uniqueItems) => [blId, uniqueItems[0]?.item ?? ""]);
    })));
    const allItems = Array.from(new Set([...items, ...blIdsToItemIdMap.values()]));
    const itemsMap = new Map((await BlStorage.Items.getMany(allItems)).map((item) => [item.id, item]));
    return userMatches.map((userMatch) => addDetailsToMatch(userMatch, userDetailsMap, blIdsToItemIdMap, itemsMap));
}
