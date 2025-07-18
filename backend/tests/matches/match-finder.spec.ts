import { test } from "@japa/runner";

import { MatchFinder } from "#controllers/matches/helpers/match-finder/match-finder";
import {
  createFakeMatchableUser,
  createFakeStandMatch,
  createFakeUserMatch,
  createMatchableUsersWithIdSuffix,
  createUserGroup,
  seededRandom,
  shuffler,
} from "#controllers/matches/helpers/match-finder/match-testing-utils";
import { MatchableUser } from "#controllers/matches/helpers/match-finder/match-types";
import otto_treider_test_users_year_0 from "backend/tests/matches/test-data/test_users_year_0.json" with { type: "json" };
import otto_treider_test_users_year_1 from "backend/tests/matches/test-data/test_users_year_1.json" with { type: "json" };
import otto_treider_test_users_year_2 from "backend/tests/matches/test-data/test_users_year_2.json" with { type: "json" };
import ullern_test_users from "backend/tests/matches/test-data/ullern_test_users.json" with { type: "json" };

const andrine = createFakeMatchableUser("andrine", ["book1", "book2", "book3"]);

const beate = createFakeMatchableUser("beate", [], ["book1", "book2", "book3"]);

const monika = createFakeMatchableUser("monika", ["book4"]);
const mons = createFakeMatchableUser("mons", [], ["book4"]);

const mathias = createFakeMatchableUser("mathias", [
  "book1",
  "book2",
  "book3",
  "book4",
]);
const mathea = createFakeMatchableUser(
  "mathea",
  [],
  ["book1", "book2", "book3", "book4"],
);

test.group("Full User Match", async () => {
  test("should be able to full match with other user", async ({ assert }) => {
    const matchFinder = new MatchFinder([andrine, beate]);
    const [userMatches, standMatches] = matchFinder.generateMatches();
    const expectedMatch = createFakeUserMatch(andrine, beate, andrine.items);
    assert.deepEqual(userMatches, [expectedMatch]);
    assert.deepEqual(standMatches, []);
  });

  test("should not fully match with non overlapping receivers", async ({
    assert,
  }) => {
    const matchFinder = new MatchFinder([andrine, mons]);
    const [userMatches, standMatches] = matchFinder.generateMatches();
    assert.deepEqual(userMatches, []);
    assert.deepEqual(standMatches, [
      createFakeStandMatch(andrine, new Set(), andrine.items),
      createFakeStandMatch(mons, mons.wantedItems, new Set()),
    ]);
  });

  test("should full match after removing excessive delivery items", async ({
    assert,
  }) => {
    const matchFinder = new MatchFinder([mathias, beate]);
    const [userMatches, standMatches] = matchFinder.generateMatches();

    const expectedUserMatch = createFakeUserMatch(
      mathias,
      beate,
      new Set(["book1", "book2", "book3"]),
    );
    const expectedStandMatch = createFakeStandMatch(
      mathias,
      new Set(),
      new Set(["book4"]),
    );
    assert.deepEqual(userMatches, [expectedUserMatch]);
    assert.deepEqual(standMatches, [expectedStandMatch]);
  });

  test("should create delivery match when all items are not wanted", async ({
    assert,
  }) => {
    const matchFinder = new MatchFinder([andrine]);
    const [userMatches, standMatches] = matchFinder.generateMatches();
    // NB: assert.deepEqual cares about the order of items in a set!
    assert.deepEqual(standMatches, [
      createFakeStandMatch(andrine, new Set(), andrine.items),
    ]);
    assert.deepEqual(userMatches, []);
  });

  test("should be able to create multiple full matches with overlapping books", async () => {
    const mathea2 = { ...mathea, id: "mathea2" };
    const matchFinder = new MatchFinder([
      monika,
      mathias,
      mathea,
      mons,
      mathea2,
    ]);
    // If this does not throw, it was successful
    matchFinder.generateMatches();
  });
});

test.group("Partly User Match", async () => {
  test("should create one full match and one partly", async ({ assert }) => {
    const matchFinder = new MatchFinder([andrine, mathias, mons, beate]);
    const [userMatches, standMatches] = matchFinder.generateMatches();
    const andrineXbeate = createFakeUserMatch(andrine, beate, andrine.items);
    const mathiasXmons = createFakeUserMatch(
      mons,
      mathias,
      [],
      mathias.items.intersection(mons.wantedItems),
    );
    const mathiasXstand = createFakeStandMatch(
      mathias,
      new Set(),
      mathias.items.difference(monika.items),
    );

    assert.deepEqual(userMatches, [andrineXbeate, mathiasXmons]);
    assert.deepEqual(standMatches, [mathiasXstand]);
  });

  test("should be able to fully match and partly match a set of ordered users", async ({
    assert,
  }) => {
    const senderGroupA = createUserGroup("sender-A", 10, ["A", "B", "C"], []);
    const senderGroupB = createUserGroup("sender-B", 5, ["A"], []);
    const senderGroupC = createUserGroup("sender-C", 5, ["B", "C"], []);

    const receiverGroupA = createUserGroup(
      "receiver-A",
      10,
      [],
      ["A", "B", "C"],
    );
    const receiverGroupB = createUserGroup("receiver-B", 5, [], ["A", "B"]);
    const receiverGroupC = createUserGroup("receiver-C", 5, [], ["C"]);

    // They match as follows:
    // A => A
    // B => B
    // C => B, C
    const matchFinder = new MatchFinder(
      [
        senderGroupA,
        senderGroupB,
        senderGroupC,
        receiverGroupA,
        receiverGroupB,
        receiverGroupC,
      ].flat(),
    );
    const [userMatches, standMatches] = matchFinder.generateMatches();
    assert.lengthOf(userMatches, 25);
    assert.lengthOf(standMatches, 0);
  });

  test("should be able to fully match and partly match a set of shuffled users", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(12345));
    const senderGroupA = createUserGroup("sender-A", 10, ["A", "B", "C"], []);
    const senderGroupB = createUserGroup("sender-B", 5, ["A"], []);
    const senderGroupC = createUserGroup("sender-C", 5, ["B", "C"], []);

    const receiverGroupA = createUserGroup(
      "receiver-A",
      10,
      [],
      ["A", "B", "C"],
    );
    const receiverGroupB = createUserGroup("receiver-B", 5, [], ["A", "B"]);
    const receiverGroupC = createUserGroup("receiver-C", 5, [], ["C"]);

    // They match as follows:
    // A => A
    // B => B
    // C => B, C
    const matchFinder = new MatchFinder(
      shuffle(
        [
          senderGroupA,
          senderGroupB,
          senderGroupC,
          receiverGroupA,
          receiverGroupB,
          receiverGroupC,
        ].flat(),
      ),
    );
    const [userMatches, standMatches] = matchFinder.generateMatches();
    assert.lengthOf(userMatches, 25);
    assert.lengthOf(standMatches, 0);
  });

  test("should be able to fully and partly match some ordered users, leaving some receivers to match with stand", async ({
    assert,
  }) => {
    const senderGroupA = createUserGroup("sender-A", 3, ["A"], []);
    const senderGroupB = createUserGroup("sender-B", 4, ["B"], []);
    const senderGroupC = createUserGroup("sender-C", 5, ["A", "B"], []);

    const receiverGroupA = createUserGroup("receiver-A", 10, [], ["A", "B"]);

    const matchFinder = new MatchFinder(
      [senderGroupA, senderGroupB, senderGroupC, receiverGroupA].flat(),
    );
    const [userMatches, standMatches] = matchFinder.generateMatches();

    // 5 matches made in heaven
    // 3 senderA => receiverA
    // 4 senderB => receiverA
    // 2 Stand => receiverA
    assert.lengthOf(userMatches, 12);
    assert.lengthOf(standMatches, 2);
  });

  test("should be able to fully and partly match some shuffled users, leaving some receivers to match with stand", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(12345));
    const senderGroupA = createUserGroup("sender-A", 3, ["A"], []);
    const senderGroupB = createUserGroup("sender-B", 4, ["B"], []);
    const senderGroupC = createUserGroup("sender-C", 5, ["A", "B"], []);

    const receiverGroupA = createUserGroup("receiver-A", 10, [], ["A", "B"]);

    const matchFinder = new MatchFinder(
      shuffle(
        [senderGroupA, senderGroupB, senderGroupC, receiverGroupA].flat(),
      ),
    );
    const [userMatches, standMatches] = matchFinder.generateMatches();

    // 5 matches made in heaven
    // 3 senderA => receiverA
    // 4 senderB => receiverA
    // 2 Stand => receiverA
    assert.lengthOf(userMatches, 12);
    assert.lengthOf(standMatches, 2);
  });
});

test.group("Large User Groups", async () => {
  test("can sufficiently match created user groups", async ({ assert }) => {
    const shuffle = shuffler(seededRandom(324892));
    const users = [
      createUserGroup("sender-A", 210, ["A", "C", "D"], []),
      createUserGroup("sender-B", 242, ["C", "D", "E"], []),
      createUserGroup("sender-C", 107, ["A", "E", "Z"], []),
      createUserGroup("sender-D", 90, ["A", "B", "E"], []),
      createUserGroup("receiver-A", 123, [], ["A", "B", "C", "D", "E"]),
      createUserGroup("receiver-B", 253, [], ["C", "D", "E"]),
      createUserGroup("receiver-C", 517, [], ["A"]),
    ].flat();

    const matchFinder = new MatchFinder(shuffle(users));

    const [userMatches, standMatches] = matchFinder.generateMatches();
    assert.isTrue(userMatches.length < 800);
    assert.isTrue(standMatches.length < 450);
  });

  test("can perfectly match realistic user data with itself", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(12345));
    const rawData = ullern_test_users;
    const test_senders = createMatchableUsersWithIdSuffix(rawData, true);
    const test_receivers = createMatchableUsersWithIdSuffix(rawData, false);

    const matchFinder = new MatchFinder(
      shuffle([test_senders.slice(), test_receivers.slice()].flat()),
    );

    const [userMatches, standMatches] = matchFinder.generateMatches();

    assert.lengthOf(userMatches, test_senders.length);
    assert.lengthOf(standMatches, 0);
  });

  test("can sufficiently match realistic user data with a modified version of itself", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(123454332));
    const rawData = ullern_test_users;
    const test_senders = createMatchableUsersWithIdSuffix(rawData, true);
    const test_receivers = createMatchableUsersWithIdSuffix(rawData, false);

    const matchFinder = new MatchFinder(
      shuffle([test_senders.slice(33), test_receivers.slice(20)].flat()),
    );

    const [userMatches, standMatches] = matchFinder.generateMatches();

    assert.assert(userMatches.length <= 293);
    assert.assert(standMatches.length <= 23);
  });

  test("should have a lot of pickup and deliveries when many new books are introduced", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(128738745));
    const testUsersYear1: MatchableUser[] = otto_treider_test_users_year_1.map(
      ({ items, id }) => ({
        wantedItems: new Set(items),
        items: new Set(),
        groupMembership: "unknown",
        id: id + "_year1",
      }),
    );
    const testUsersYear2: MatchableUser[] = otto_treider_test_users_year_2.map(
      ({ items, id }) => ({
        items: new Set(items),
        wantedItems: new Set(),
        groupMembership: "unknown",
        id: id + "_year2",
      }),
    );

    const matchFinder = new MatchFinder(
      shuffle([testUsersYear1, testUsersYear2].flat()),
    );

    const [userMatches, standMatches] = matchFinder.generateMatches();

    assert.assert(userMatches.length <= 82);
    assert.assert(standMatches.length <= 192);
  });

  test("should be able to sufficiently match two different year classes with similar books", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(123982));
    const testUsersYear0: MatchableUser[] = otto_treider_test_users_year_0.map(
      ({ items, id }) => ({
        wantedItems: new Set(items),
        items: new Set(),
        groupMembership: "unknown",
        id: id + "_year0",
      }),
    );
    const testUsersYear1: MatchableUser[] = otto_treider_test_users_year_1.map(
      ({ items, id }) => ({
        items: new Set(items),
        wantedItems: new Set(),
        groupMembership: "unknown",
        id: id + "_year1",
      }),
    );

    const [userMatches, standMatches] = new MatchFinder(
      shuffle([testUsersYear0, testUsersYear1].flat()),
    ).generateMatches();

    const standDeliveryItems = standMatches.flatMap((standMatch) =>
      Array.from(standMatch.expectedHandoffItems),
    );
    const standPickupItems = standMatches.flatMap((standMatch) =>
      Array.from(standMatch.expectedPickupItems),
    );

    assert.isTrue(
      standDeliveryItems.every(
        (deliveryItem) => !standPickupItems.includes(deliveryItem),
      ),
    );

    assert.assert(userMatches.length <= 86);
    assert.assert(standMatches.length <= 51);
  });
});

test.group("Users with both wantedItems and items", async () => {
  test("should partially match users that have disjoint sets of items and wants", async ({
    assert,
  }) => {
    const user1 = createFakeMatchableUser(
      "user1",
      ["book1", "book2"],
      ["book3"],
    );
    const user2 = createFakeMatchableUser("user2", ["book3"], ["book2"]);

    const matchFinder = new MatchFinder([user1, user2]);
    const [userMatches, standMatches] = matchFinder.generateMatches();

    // We expect a partial match:
    // user1 gives book2 to user2 and receives 'book3' from user2,
    // user1 gets a stand match for book1,
    assert.lengthOf(userMatches, 1);
    assert.lengthOf(standMatches, 1);
  });

  test("should handle a scenario where two users want each other’s items", async ({
    assert,
  }) => {
    // Perfect swap, no user is wanting their own items.
    const userA = createFakeMatchableUser(
      "userA",
      ["book1", "book2"],
      ["book3", "book4"],
    );
    const userB = createFakeMatchableUser(
      "userB",
      ["book3", "book4"],
      ["book1", "book2"],
    );

    const matchFinder = new MatchFinder([userA, userB]);
    const [userMatches, standMatches] = matchFinder.generateMatches();

    assert.lengthOf(userMatches, 1);
    assert.lengthOf(standMatches, 0);

    const match = userMatches[0];
    assert.includeMembers(Array.from(match?.expectedAToBItems ?? []), [
      "book1",
      "book2",
    ]);
    assert.includeMembers(Array.from(match?.expectedBToAItems ?? []), [
      "book3",
      "book4",
    ]);
  });

  test("should be able to solve complex scenario without stand matches", async ({
    assert,
  }) => {
    const group1Users = createUserGroup("group1", 2, ["A"], ["B"]);
    const group2Users = createUserGroup("group2", 2, ["B"], ["C"]);
    const group3Users = createUserGroup("group3", 2, ["C"], ["A"]);

    const matchFinder = new MatchFinder(
      [group1Users, group2Users, group3Users].flat(),
    );

    const [userMatches, standMatches] = matchFinder.generateMatches();

    assert.lengthOf(userMatches, 6);
    assert.lengthOf(standMatches, 0);
  });
});

test.group("Group matching logic", async () => {
  test("should prioritize matching similar groups first", async ({
    assert,
  }) => {
    const shuffle = shuffler(seededRandom(12345));
    const group1Users = createUserGroup("group1", 2, ["A"], ["B"], "STA");
    const group2Users = createUserGroup("group2", 2, ["B"], ["A"], "STB");
    const group3Users = createUserGroup("group3", 15, ["B"], ["A"], "STC");

    const matchFinder = new MatchFinder(
      shuffle([group1Users, group2Users, group3Users].flat()),
    );

    const [userMatches, standMatches] = matchFinder.generateMatches();
    assert.isTrue(
      userMatches.every(
        (userMatch) =>
          !userMatch.customerA.includes("group3") &&
          !userMatch.customerB.includes("group3"),
      ),
    );

    assert.lengthOf(userMatches, 2);
    assert.lengthOf(standMatches, 15);
  });
});

test.group("Faulty data checks", async () => {
  test("should throw an error if the same user is listed twice in MatchableUsers", async ({
    assert,
  }) => {
    const userDuplicateA = createFakeMatchableUser("userDup", ["A"], ["B"]);
    const userDuplicateB = { ...userDuplicateA };
    assert.throws(() => {
      new MatchFinder([userDuplicateA, userDuplicateB]);
    }, "Found duplicates in this.users");
  });

  test("should throw an error if a user wants any items that they already have", async ({
    assert,
  }) => {
    const userX = createFakeMatchableUser(
      "userX",
      ["book1", "book2"],
      ["book2"],
    );
    assert.throws(() => {
      new MatchFinder([userX]);
    }, "Users cannot want items that they already have");
  });
});
