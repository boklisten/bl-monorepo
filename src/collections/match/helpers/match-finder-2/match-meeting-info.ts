import {
  CandidateMatch,
  CandidateMatchVariant,
  CandidateStandMatch,
  CandidateUserMatch,
  MatchLocation,
  MatchWithMeetingInfo,
  StandMatchWithMeetingInfo,
  UserMatchWithMeetingInfo,
} from "@/collections/match/helpers/match-finder-2/match-types";

interface SenderWithMatches {
  senderId: string;
  matches: CandidateUserMatch[];
}

/**
 * Create a list of objects, where each object represents a sender, with the matches they are assigned as sender for
 * @param userMatches unassigned UserMatches
 */
function groupMatchesBySender(
  userMatches: CandidateUserMatch[],
): SenderWithMatches[] {
  return userMatches
    .reduce((acc, match) => {
      const foundSender = acc.find(
        (sender) => sender.senderId === match.senderId,
      );
      if (foundSender) {
        foundSender.matches.push(match);
      } else {
        acc.push({ senderId: match.senderId, matches: [match] });
      }
      return acc;
    }, [] as SenderWithMatches[])
    .sort((a, b) => (a.matches.length > b.matches.length ? -1 : 1));
}

/**
 * @param location a location with a corresponding limit towards how many matches can be assigned to that location at a given time
 * @param existingMeetingTimes an ascending list of previous meeting times for the location
 * @param startTime the earliest possible timeslot
 * @param meetingDurationInMS the estimated duration of the meeting
 */
function findEarliestLocationTime(
  location: MatchLocation,
  existingMeetingTimes: Date[],
  startTime: Date,
  meetingDurationInMS: number,
): Date {
  if (
    !location.simultaneousMatchLimit ||
    existingMeetingTimes.length < location.simultaneousMatchLimit
  ) {
    return startTime;
  }
  const prevMeetingTime = existingMeetingTimes?.at(-1);
  const simultaneousMatches = existingMeetingTimes.filter(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (meetingTime) => meetingTime.getTime() === prevMeetingTime.getTime(),
  );

  if (simultaneousMatches.length < location.simultaneousMatchLimit) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return prevMeetingTime;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Date(prevMeetingTime.getTime() + meetingDurationInMS);
}

/**
 * Find the first possible time after the startTime where all the users are available
 * @param users the users to find a timeslot for
 * @param startTime the earliest possible timeslot
 * @param userMeetingTimes an ascending list of previous meeting times for each user
 * @param meetingDurationInMS the estimated duration of the meeting
 */
function findEarliestPossibleMeetingTime(
  users: string[],
  startTime: Date,
  userMeetingTimes: Record<string, Date[]>,
  meetingDurationInMS: number,
): Date {
  let earliestPossibleTime = startTime;
  for (const user of users) {
    const prevUserTime = userMeetingTimes[user]?.at(-1);
    if (prevUserTime && prevUserTime >= earliestPossibleTime) {
      earliestPossibleTime = new Date(
        prevUserTime.getTime() + meetingDurationInMS,
      );
    }
  }
  return earliestPossibleTime;
}

/**
 * Verifies that the stand matches has the correct location and no assigned time
 * @param standMatches the updated stand matches
 * @param standLocation the location of the stand
 */
function verifyStandMatches(
  standMatches: StandMatchWithMeetingInfo[],
  standLocation: string,
) {
  if (
    standMatches.some((match) => match.meetingInfo.location !== standLocation)
  ) {
    throw new Error("All stand matches must have correct location");
  }
}

/**
 * Checks that:
 * - Every input match has a corresponding updated match that has been assigned a time and location
 * - the meeting location is valid and that the meeting time is in the future
 * - no user has two simultaneous meetings at different locations
 * @param userMatches
 * @param userMatchesWithMeetingInfo
 * @param startTime
 * @param userMatchLocations
 */
function verifyUserMatches(
  userMatches: CandidateUserMatch[],
  userMatchesWithMeetingInfo: UserMatchWithMeetingInfo[],
  startTime: Date,
  userMatchLocations: MatchLocation[],
) {
  if (
    userMatches.length !== userMatchesWithMeetingInfo.length ||
    !userMatches.every((userMatch) => {
      const createdMeetingInfoMatch = userMatchesWithMeetingInfo.find(
        (userMatchWithInfo) =>
          userMatch.senderId === userMatchWithInfo.senderId &&
          userMatch.receiverId === userMatchWithInfo.receiverId &&
          userMatch.items === userMatchWithInfo.items,
      );
      if (createdMeetingInfoMatch === undefined) {
        return false;
      }
      return (
        userMatchLocations
          .map((location) => location.name)
          .includes(createdMeetingInfoMatch.meetingInfo.location) &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createdMeetingInfoMatch.meetingInfo.date >= startTime
      );
    })
  ) {
    throw new Error(
      "Every user match must have a corresponding match with assigned meeting info",
    );
  }

  for (const userMatchWithMeetingInfo of userMatchesWithMeetingInfo) {
    const crashingSenderMatch = userMatchesWithMeetingInfo.find(
      (match) =>
        match.senderId === userMatchWithMeetingInfo.senderId &&
        match.receiverId !== userMatchWithMeetingInfo.receiverId &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        match.meetingInfo.date.getTime() ===
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          userMatchWithMeetingInfo.meetingInfo.date.getTime() &&
        match.meetingInfo.location !==
          userMatchWithMeetingInfo.meetingInfo.location,
    );
    const crashingReceiverMatch = userMatchesWithMeetingInfo.find(
      (match) =>
        match.receiverId === userMatchWithMeetingInfo.receiverId &&
        match.senderId !== userMatchWithMeetingInfo.senderId &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        match.meetingInfo.date.getTime() ===
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          userMatchWithMeetingInfo.meetingInfo.date.getTime() &&
        match.meetingInfo.location !==
          userMatchWithMeetingInfo.meetingInfo.location,
    );

    if (crashingSenderMatch || crashingReceiverMatch) {
      throw new Error(
        "A sender or receiver has two simultaneous matches at different locations!",
      );
    }
  }
}

/**
 *
 * @param matches matches generated from matchFinder
 * @param standLocation the location of the stand
 * @param userMatchLocations the allowed locations for user matches, optionally with a limit on how many simultaneous matches can fit there
 * @param startTime the first allowed meeting time
 * @param meetingDurationInMS the estimated duration of the meeting
 */
function assignMeetingInfoToMatches(
  matches: CandidateMatch[],
  standLocation: string,
  userMatchLocations: MatchLocation[],
  startTime: Date,
  meetingDurationInMS: number,
): MatchWithMeetingInfo[] {
  const userMatches: CandidateUserMatch[] = matches
    .filter((match) => match.variant === CandidateMatchVariant.UserMatch)
    .map((match) => match as CandidateUserMatch);

  const sendersWithMatches = groupMatchesBySender(userMatches);

  const userMeetingTimes: Record<string, Date[]> = userMatches.reduce(
    (acc, userMatch) => ({
      ...acc,
      [userMatch.senderId]: [],
      [userMatch.receiverId]: [],
    }),
    {},
  );

  const locationMeetingTimes: Record<string, Date[]> =
    userMatchLocations.reduce(
      (acc, location) => ({
        ...acc,
        [location.name]: [],
      }),
      {},
    );

  let locationIndex = 0;
  const userMatchesWithMeetingInfo: UserMatchWithMeetingInfo[] = [];

  for (const senderWithMatches of sendersWithMatches) {
    const location = userMatchLocations[locationIndex];
    locationIndex = (locationIndex + 1) % userMatchLocations.length;

    const earliestLocationTime = findEarliestLocationTime(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      location,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      locationMeetingTimes[location.name],
      startTime,
      meetingDurationInMS,
    );

    const receivers = senderWithMatches.matches.map(
      (match) => match.receiverId,
    );
    const earliestPossibleTime = findEarliestPossibleMeetingTime(
      [senderWithMatches.senderId, ...receivers],
      earliestLocationTime,
      userMeetingTimes,
      meetingDurationInMS,
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    userMeetingTimes[senderWithMatches.senderId].push(earliestPossibleTime);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    locationMeetingTimes[location.name].push(earliestPossibleTime);
    for (const match of senderWithMatches.matches) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      userMeetingTimes[match.receiverId].push(earliestPossibleTime);

      userMatchesWithMeetingInfo.push({
        ...match,
        meetingInfo: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          location: location.name,
          date: earliestPossibleTime,
        },
      });
    }
  }
  verifyUserMatches(
    userMatches,
    userMatchesWithMeetingInfo,
    startTime,
    userMatchLocations,
  );

  const standMatches: CandidateStandMatch[] = matches
    .filter((match) => match.variant === CandidateMatchVariant.StandMatch)
    .map((match) => match as CandidateStandMatch);

  const standMatchesWithMeetingInfo: StandMatchWithMeetingInfo[] =
    standMatches.map((match) => ({
      ...match,
      meetingInfo: {
        location: standLocation,
        date: new Date(
          userMatchesWithMeetingInfo
            .filter(
              (matchWithMeetingInfo) =>
                matchWithMeetingInfo.senderId === match.userId ||
                matchWithMeetingInfo.receiverId === match.userId,
            )
            .reduce((latestTime, next) => {
              const potentialTime =
                next.meetingInfo.date.getTime() + meetingDurationInMS;
              return potentialTime > latestTime ? potentialTime : latestTime;
            }, startTime.getTime()),
        ),
      },
    }));

  verifyStandMatches(standMatchesWithMeetingInfo, standLocation);

  return [...userMatchesWithMeetingInfo, ...standMatchesWithMeetingInfo];
}

export default assignMeetingInfoToMatches;
