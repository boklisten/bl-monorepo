// mulberry32 PRNG: https://stackoverflow.com/a/47593316
import {
  CandidateMatch,
  CandidateMatchVariant,
  CandidateStandMatch,
  CandidateUserMatch,
  MatchableUser,
} from "@backend/collections/match/helpers/match-finder/match-types";

export function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d_2b_79_f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function calculateNumberOfMatchesPerType(matches: CandidateMatch[]) {
  return matches.reduce(
    (accumulator, match) => ({
      standMatches:
        accumulator.standMatches +
        (match.variant === CandidateMatchVariant.StandMatch ? 1 : 0),
      userMatches:
        accumulator.userMatches +
        (match.variant === CandidateMatchVariant.UserMatch ? 1 : 0),
    }),
    { standMatches: 0, userMatches: 0 },
  );
}

export function createFakeUserMatch(
  sender: MatchableUser,
  receiver: MatchableUser,
  items: Set<string>,
): CandidateUserMatch {
  return {
    variant: CandidateMatchVariant.UserMatch,
    senderId: sender.id,
    receiverId: receiver.id,
    items,
  };
}

export function createFakeStandMatch(
  user: MatchableUser,
  pickupItems: Set<string>,
  handoffItems: Set<string>,
): CandidateStandMatch {
  return {
    variant: CandidateMatchVariant.StandMatch,
    userId: user.id,
    pickupItems,
    handoffItems,
  };
}

export function createFakeMatchableUser(
  id: string,
  ...items: string[]
): MatchableUser {
  return {
    id,
    items: new Set(items),
  };
}

export function createUserGroup(
  idSuffix: string,
  size: number,
  ...items: string[]
): MatchableUser[] {
  return [...new Array(size)].map((_, id) =>
    createFakeMatchableUser(id + idSuffix, ...items),
  );
}

export function groupMatchesByUser(matches: CandidateMatch[]) {
  const matchesPerUser: { id: string; matches: CandidateMatch[] }[] = [];
  const appendMatchToUser = (match: CandidateMatch, userId: string) => {
    const foundSender = matchesPerUser.find((user) => user.id === userId);
    if (foundSender) {
      foundSender.matches.push(match);
    } else {
      matchesPerUser.push({ id: userId, matches: [match] });
    }
  };

  for (const match of matches) {
    if (match.variant === CandidateMatchVariant.UserMatch) {
      appendMatchToUser(match, match.senderId);
      appendMatchToUser(match, match.receiverId);
    } else if (match.variant === CandidateMatchVariant.StandMatch) {
      appendMatchToUser(match, match.userId);
    }
  }
  return matchesPerUser.sort((a, b) =>
    a.matches.length > b.matches.length ? -1 : 1,
  );
}

// in place shuffle with seed, Fisher-Yates
export const shuffler =
  (randomizer: () => number) =>
  <T>(list: T[]): T[] => {
    for (let index = 0; index < list.length; index++) {
      const random = index + Math.floor(randomizer() * (list.length - index));
      const temporary = list[random];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      list[random] = list[index]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      list[index] = temporary!;
    }
    return list;
  };

export function createMatchableUsersWithIdSuffix(
  rawData: { id: string; items: { $numberLong: string }[] }[],
  idSuffix: string,
): MatchableUser[] {
  return rawData.map(({ id, items }) => ({
    id: id + idSuffix,
    items: new Set(items.map((item) => item["$numberLong"])),
  }));
}

/**
 * Utility method to print some stats about the matching
 * so that one can evaluate the performance of the matcher
 * @param matches
 */
export function printPerformanceMetrics(matches: CandidateMatch[]) {
  const numberOfMatchesPerType = calculateNumberOfMatchesPerType(matches);
  const groupedUsers = groupMatchesByUser(matches);
  const userCounts = {};
  for (const user of groupedUsers) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const previousValue = userCounts[user.matches.length];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    userCounts[user.matches.length] =
      previousValue === undefined ? 1 : previousValue + 1;
  }
  console.log(`
NoMatches: ${matches.length},
UserMatches: ${numberOfMatchesPerType.userMatches},
StandMatches: ${numberOfMatchesPerType.standMatches},
NoMatches Per User
${Object.keys(userCounts)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  .map((key) => key + ": " + userCounts[key] + " kunder,\n")
  .join("")}
`);
}
