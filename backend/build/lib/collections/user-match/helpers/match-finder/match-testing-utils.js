export function seededRandom(seed) {
    return function () {
        let t = (seed += 0x6d_2b_79_f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    };
}
export function createFakeUserMatch(customerA, customerB, AToBItems, BToAItems) {
    return {
        customerA: customerA.id,
        customerB: customerB.id,
        expectedAToBItems: new Set(AToBItems),
        expectedBToAItems: new Set(BToAItems),
    };
}
export function createFakeStandMatch(user, expectedPickupItems, expectedHandoffItems) {
    return {
        customer: user.id,
        expectedPickupItems,
        expectedHandoffItems,
    };
}
export function createFakeMatchableUser(id, items, wantedItems, groupMembership) {
    return {
        id,
        items: new Set(items),
        wantedItems: new Set(wantedItems ?? []),
        groupMembership: groupMembership ?? "unknown",
    };
}
export function createUserGroup(idSuffix, size, items, wantedItems, membership) {
    return [...new Array(size)].map((_, id) => createFakeMatchableUser(id + idSuffix, items, wantedItems, membership));
}
// in place shuffle with seed, Fisher-Yates
export const shuffler = (randomizer) => (list) => {
    for (let index = 0; index < list.length; index++) {
        const random = index + Math.floor(randomizer() * (list.length - index));
        const temporary = list[random];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        list[random] = list[index];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        list[index] = temporary;
    }
    return list;
};
export function createMatchableUsersWithIdSuffix(rawData, isSender) {
    return rawData.map(({ id, items }) => {
        const processedItems = new Set(items.map((item) => item["$numberLong"]));
        return {
            id: id + (isSender ? "_sender" : "_receiver"),
            items: isSender ? processedItems : new Set(),
            wantedItems: isSender ? new Set() : processedItems,
            groupMembership: "unknown",
        };
    });
}
