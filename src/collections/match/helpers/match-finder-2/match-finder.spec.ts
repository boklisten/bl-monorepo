import "mocha";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

import { MatchFinder } from "@/collections/match/helpers/match-finder-2/match-finder";
import {
  calculateNumberOfMatchesPerType,
  createFakeMatchableUser,
  createFakeStandMatch,
  createFakeUserMatch,
  createUserGroup,
  groupMatchesByUser,
  seededRandom,
  shuffler,
  createMatchableUsersWithIdSuffix,
} from "@/collections/match/helpers/match-finder-2/match-testing-utils";
import {
  CandidateMatchVariant,
  CandidateStandMatch,
  MatchableUser,
} from "@/collections/match/helpers/match-finder-2/match-types";
import otto_treider_test_users_year_0 from "@/collections/match/helpers/match-finder-2/test-data/test_users_year_0.json";
import otto_treider_test_users_year_1 from "@/collections/match/helpers/match-finder-2/test-data/test_users_year_1.json";
import otto_treider_test_users_year_2 from "@/collections/match/helpers/match-finder-2/test-data/test_users_year_2.json";
import ullern_test_users from "@/collections/match/helpers/match-finder-2/test-data/ullern_test_users.json";
import { difference, intersect } from "@/collections/match/helpers/set-methods";

chai.use(chaiAsPromised);
chai.use(sinonChai);

const andrine = createFakeMatchableUser("andrine", "book1", "book2", "book3");

const beate = createFakeMatchableUser("beate", "book1", "book2", "book3");

const monika = createFakeMatchableUser("monika", "book4");
const mons = createFakeMatchableUser("mons", "book4");

const mathias = createFakeMatchableUser(
  "mathias",
  "book1",
  "book2",
  "book3",
  "book4",
);
const mathea = createFakeMatchableUser(
  "mathea",
  "book1",
  "book2",
  "book3",
  "book4",
);

describe("Full User Match", () => {
  it("should be able to full match with other user", () => {
    const matchFinder = new MatchFinder([andrine], [beate]);
    const matches = matchFinder.generateMatches();
    const expectedMatch = createFakeUserMatch(andrine, beate, andrine.items);
    assert.deepEqual(matches, [expectedMatch]);
  });

  it("should not fully match with non overlapping receivers", () => {
    const matchFinder = new MatchFinder([andrine], [monika]);
    const matches = matchFinder.generateMatches();
    assert.deepEqual(matches, [
      createFakeStandMatch(andrine, new Set(), andrine.items),
      createFakeStandMatch(monika, monika.items, new Set()),
    ]);
  });

  it("should full match after removing excessive delivery items", () => {
    const matchFinder = new MatchFinder([mathias], [beate]);
    const matches = matchFinder.generateMatches();

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
    assert.deepEqual(matches, [expectedStandMatch, expectedUserMatch]);
  });

  it("should create delivery match when all items are not wanted", () => {
    const matchFinder = new MatchFinder([andrine], []);
    const matches = matchFinder.generateMatches();
    // NB: assert.deepEqual cares about the order of items in a set!
    assert.deepEqual(matches, [
      createFakeStandMatch(andrine, new Set(), andrine.items),
    ]);
  });

  it("should be able to create multiple full matches with overlapping books", () => {
    const matchFinder = new MatchFinder(
      [monika, mathias],
      [mathea, mons, mathea],
    );
    matchFinder.generateMatches();
    expect(
      Array.from(matchFinder.senders).filter(
        (sender) => sender.items.size !== 0,
      ).length,
    ).to.equal(0);
    expect(
      Array.from(matchFinder.receivers).filter(
        (receiver) => receiver.items.size !== 0,
      ).length,
    ).to.equal(0);
  });

  it("should not be able to match users with themselves", () => {
    const matchFinder = new MatchFinder([andrine], [andrine]);
    const matches = matchFinder.generateMatches();

    const andrineXstand = createFakeStandMatch(
      andrine,
      andrine.items,
      andrine.items,
    );
    assert.deepEqual(matches, [andrineXstand]);
  });
});

describe("Partly User Match", () => {
  it("should create one full match and one partly", () => {
    const matchFinder = new MatchFinder([andrine, mathias], [monika, beate]);
    const matches = matchFinder.generateMatches();
    const andrineXbeate = createFakeUserMatch(andrine, beate, andrine.items);
    const mathiasXmonika = createFakeUserMatch(
      mathias,
      monika,
      intersect(mathias.items, monika.items),
    );
    const mathiasXstand = createFakeStandMatch(
      mathias,
      new Set(),
      difference(mathias.items, monika.items),
    );

    assert.deepEqual(matches, [andrineXbeate, mathiasXstand, mathiasXmonika]);
  });

  it("should be able to fully match and partly match a set of ordered users", () => {
    const senderGroupA = createUserGroup("sender-A", 10, "A", "B", "C");
    const senderGroupB = createUserGroup("sender-B", 5, "A");
    const senderGroupC = createUserGroup("sender-C", 5, "B", "C");

    const receiverGroupA = createUserGroup("receiver-A", 10, "A", "B", "C");
    const receiverGroupB = createUserGroup("receiver-B", 5, "A", "B");
    const receiverGroupC = createUserGroup("receiver-C", 5, "C");

    // They match give as follows:
    // A => B
    // B => C
    // C => B, C
    const matchFinder = new MatchFinder(
      [...senderGroupA, ...senderGroupB, ...senderGroupC],
      [...receiverGroupA, ...receiverGroupB, ...receiverGroupC],
    );
    const matches = matchFinder.generateMatches();
    expect(
      Array.from(matchFinder.senders).filter(
        (sender) => sender.items.size !== 0,
      ).length,
    ).to.equal(0);
    expect(
      Array.from(matchFinder.receivers).filter(
        (receiver) => receiver.items.size !== 0,
      ).length,
    ).to.equal(0);
    expect(matches.length).to.equal(25);
  });

  it("should be able to fully match and partly match a set of shuffled users", () => {
    const shuffle = shuffler(seededRandom(12345));
    const senderGroupA = createUserGroup("sender-A", 10, "A", "B", "C");
    const senderGroupB = createUserGroup("sender-B", 5, "A");
    const senderGroupC = createUserGroup("sender-C", 5, "B", "C");

    const receiverGroupA = createUserGroup("receiver-A", 10, "A", "B", "C");
    const receiverGroupB = createUserGroup("receiver-B", 5, "A", "B");
    const receiverGroupC = createUserGroup("receiver-C", 5, "C");

    // They match give as follows:
    // A => B
    // B => C
    // C => B, C
    const matchFinder = new MatchFinder(
      shuffle([...senderGroupA, ...senderGroupB, ...senderGroupC]),
      shuffle([...receiverGroupA, ...receiverGroupB, ...receiverGroupC]),
    );
    const matches = matchFinder.generateMatches();
    expect(
      Array.from(matchFinder.senders).filter(
        (sender) => sender.items.size !== 0,
      ).length,
    ).to.equal(0, "expected number of senders with remaining items to be 0");
    expect(
      Array.from(matchFinder.receivers).filter(
        (receiver) => receiver.items.size !== 0,
      ).length,
    ).to.equal(0, "expected number of receivers with remaining items to be 0");
    expect(matches.length).to.be.lessThan(
      30,
      "expected reasonable number of matches",
    );
  });

  it("should be able to fully and partly match some ordered users, leaving some receivers to match with stand", () => {
    const senderGroupA = createUserGroup("sender-A", 3, "A");
    const senderGroupB = createUserGroup("sender-B", 4, "B");
    const senderGroupC = createUserGroup("sender-C", 5, "A", "B");

    const receiverGroupA = createUserGroup("receiver-A", 10, "A", "B");

    const matchFinder = new MatchFinder(
      [...senderGroupA, ...senderGroupB, ...senderGroupC],
      receiverGroupA,
    );
    const matches = matchFinder.generateMatches();
    expect(
      Array.from(matchFinder.senders).every(
        (sender) => sender.items.size === 0,
      ),
    ).to.be.true;

    expect(
      Array.from(matchFinder.receivers).every(
        (receiver) => receiver.items.size === 0,
      ),
    ).to.be.true;

    // 5 matches made in heaven
    // 3 senderA => receiverA
    // 3 senderB => receiverA
    // 1 senderB => Stand
    // 2 Stand => receiverA
    expect(matches.length).to.equal(14);
  });

  it("should be able to fully and partly match some shuffled users, leaving some receivers to match with stand", () => {
    const shuffle = shuffler(seededRandom(12345));
    const senderGroupA = createUserGroup("sender-A", 3, "A");
    const senderGroupB = createUserGroup("sender-B", 4, "B");
    const senderGroupC = createUserGroup("sender-C", 5, "A", "B");

    const receiverGroupA = createUserGroup("receiver-A", 10, "A", "B");

    const matchFinder = new MatchFinder(
      shuffle([...senderGroupA, ...senderGroupB, ...senderGroupC]),
      shuffle(receiverGroupA),
    );
    const matches = matchFinder.generateMatches();
    expect(
      Array.from(matchFinder.senders).every(
        (sender) => sender.items.size === 0,
      ),
    ).to.be.true;

    expect(
      Array.from(matchFinder.receivers).every(
        (receiver) => receiver.items.size === 0,
      ),
    ).to.be.true;

    // 5 matches made in heaven
    // 3 senderA => receiverA
    // 3 senderB => receiverA
    // 1 senderB => Stand
    // 2 Stand => receiverA
    expect(matches.length).to.equal(14);
  });
});

describe("Large User Groups", () => {
  it("can sufficiently match created user groups", () => {
    const shuffle = shuffler(seededRandom(324892));
    const senderGroups = [
      createUserGroup("sender-A", 210, "A", "C", "D"),
      createUserGroup("sender-B", 242, "C", "D", "E"),
      createUserGroup("sender-C", 107, "A", "E", "Z"),
      createUserGroup("sender-D", 90, "A", "B", "E"),
    ];

    const recieverGroups = [
      createUserGroup("receiver-A", 123, "A", "B", "C", "D", "E"),
      createUserGroup("receiver-B", 253, "C", "D", "E"),
      createUserGroup("receiver-C", 517, "A"),
    ];

    const matchFinder = new MatchFinder(
      shuffle(senderGroups.flat()),
      shuffle(recieverGroups.flat()),
    );

    const matches = Array.from(matchFinder.generateMatches());

    const numberOfMatchesPerType = calculateNumberOfMatchesPerType(matches);

    expect(numberOfMatchesPerType.userMatches).to.be.lessThan(
      senderGroups.flat().length * 1.5,
    );
    expect(numberOfMatchesPerType.standMatches).to.be.lessThan(
      recieverGroups.flat().length * 0.6,
    );
  });

  it("can sufficiently match realistic user data with itself", () => {
    const shuffle = shuffler(seededRandom(12345));
    const rawData = ullern_test_users;
    const test_senders = createMatchableUsersWithIdSuffix(rawData, "_sender");
    const test_receivers = createMatchableUsersWithIdSuffix(
      rawData,
      "_receiver",
    );

    const matchFinder = new MatchFinder(
      shuffle(test_senders.slice()),
      shuffle(test_receivers.slice()),
    );

    const matches = Array.from(matchFinder.generateMatches());

    const numberOfMatchesPerType = calculateNumberOfMatchesPerType(matches);

    expect(numberOfMatchesPerType.userMatches).to.be.lessThan(
      test_senders.length * 1.4,
    );
    expect(numberOfMatchesPerType.standMatches).to.be.lessThanOrEqual(
      test_senders.length * 0.1,
    );
  });

  it("can sufficiently match realistic user data with a modified version of itself", () => {
    const shuffle = shuffler(seededRandom(123454332));
    const rawData = ullern_test_users;
    const test_senders = createMatchableUsersWithIdSuffix(rawData, "_sender");
    const test_receivers = createMatchableUsersWithIdSuffix(
      rawData,
      "_receiver",
    );

    const matchFinder = new MatchFinder(
      shuffle(test_senders.slice()).slice(33),
      shuffle(test_receivers.slice()).slice(20),
    );

    const matches = Array.from(matchFinder.generateMatches());

    const numberOfMatchesPerType = calculateNumberOfMatchesPerType(matches);

    expect(numberOfMatchesPerType.userMatches).to.be.lessThan(
      test_senders.flat().length * 1.4,
    );
    expect(numberOfMatchesPerType.standMatches).to.be.lessThanOrEqual(
      test_senders.flat().length * 0.2,
    );
  });

  it("should have a lot of pickup and deliveries when many new books are introduced", () => {
    const shuffle = shuffler(seededRandom(128738745));
    const testUsersYear1: MatchableUser[] = otto_treider_test_users_year_1.map(
      ({ items, id }) => ({ items: new Set(items), id }),
    );
    const testUsersYear2: MatchableUser[] = otto_treider_test_users_year_2.map(
      ({ items, id }) => ({ items: new Set(items), id }),
    );

    const matchFinder = new MatchFinder(
      shuffle(testUsersYear1),
      shuffle(testUsersYear2),
    );

    const matches = Array.from(matchFinder.generateMatches());

    const numberOfMatchesPerType = calculateNumberOfMatchesPerType(matches);

    expect(numberOfMatchesPerType.userMatches).to.be.lessThan(
      testUsersYear1.flat().length * 1.1,
    );
    expect(numberOfMatchesPerType.standMatches).to.be.greaterThan(
      testUsersYear2.length * 0.9,
    );
  });

  it("should be able to sufficiently match two different year classes with similar books", () => {
    const shuffle = shuffler(seededRandom(123982));
    const testUsersYear0: MatchableUser[] = otto_treider_test_users_year_0.map(
      ({ items, id }) => ({ items: new Set(items), id }),
    );
    const testUsersYear1: MatchableUser[] = otto_treider_test_users_year_1.map(
      ({ items, id }) => ({ items: new Set(items), id }),
    );

    const matchFinder = new MatchFinder(
      shuffle(testUsersYear0),
      shuffle(testUsersYear1),
    );

    const matches = Array.from(matchFinder.generateMatches());

    const numberOfMatchesPerType = calculateNumberOfMatchesPerType(matches);

    const standDeliveryItems = matches
      .filter((match) => match.variant === CandidateMatchVariant.StandMatch)
      .flatMap((match) =>
        Array.from((match as CandidateStandMatch).handoffItems),
      );
    const standPickupItems = matches
      .filter((match) => match.variant === CandidateMatchVariant.StandMatch)
      .flatMap((match) =>
        Array.from((match as CandidateStandMatch).pickupItems),
      );

    expect(
      standDeliveryItems.every(
        (deliveryItem) => !standPickupItems.includes(deliveryItem),
      ),
    );

    const groupedUsers = groupMatchesByUser(matches);
    expect(groupedUsers[0]?.matches.length).to.be.lessThanOrEqual(3);

    expect(numberOfMatchesPerType.userMatches).to.be.lessThan(
      testUsersYear0.length * 1.1,
    );
    expect(numberOfMatchesPerType.standMatches).to.be.lessThan(
      testUsersYear0.length * 0.65,
    );
  });
});
