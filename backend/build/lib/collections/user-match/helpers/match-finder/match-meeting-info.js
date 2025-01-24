export {};
/* fixme: rewrite
import { MatchLocation } from "@backend/src/collections/user-match/helpers/match-finder/match-types.js";
import { logger } from "@backend/src/logger/logger.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { CandidateStandMatch, StandMatch } from "@shared/match/stand-match.js";
import { CandidateUserMatch, UserMatch } from "@shared/match/user-match.js";
import moment from "moment";

/!**
 * @param location a location with a corresponding limit towards how many matches can be assigned to that location at a given time
 * @param existingMeetingTimes an ascending list of previous meeting times for the location
 * @param startTime the earliest possible timeslot
 * @param meetingDurationInMS the estimated duration of the meeting
 *!/
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
  const previousMeetingTime = existingMeetingTimes?.at(-1);
  const simultaneousMatches = existingMeetingTimes.filter(
    
    // @ts-expect-error fixme: auto ignored
    (meetingTime) => meetingTime.getTime() === previousMeetingTime.getTime(),
  );

  if (simultaneousMatches.length < location.simultaneousMatchLimit) {
    
    // @ts-expect-error fixme: auto ignored
    return previousMeetingTime;
  }

  
  // @ts-expect-error fixme: auto ignored
  return new Date(previousMeetingTime.getTime() + meetingDurationInMS);
}

/!**
 * Find the first possible time after the startTime where all the users are available
 * @param users the users to find a timeslot for
 * @param startTime the earliest possible timeslot
 * @param userMeetingTimes an ascending list of previous meeting times for each user
 * @param meetingDurationInMS the estimated duration of the meeting
 *!/
function findEarliestPossibleMeetingTime(
  users: string[],
  startTime: Date,
  userMeetingTimes: Record<string, Date[]>,
  meetingDurationInMS: number,
): Date {
  let earliestPossibleTime = startTime;
  for (const user of users) {
    const previousUserTime = userMeetingTimes[user]?.at(-1);
    if (previousUserTime && previousUserTime >= earliestPossibleTime) {
      earliestPossibleTime = new Date(
        previousUserTime.getTime() + meetingDurationInMS,
      );
    }
  }
  return earliestPossibleTime;
}

/!**
 * Verifies that the stand matches has the correct location and no assigned time
 * @param standMatches the updated stand matches
 * @param standLocation the location of the stand
 *!/
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

/!**
 * Checks that:
 * - Every input match has a corresponding updated match that has been assigned a time and location
 * - the meeting location is valid and that the meeting time is in the future
 * - no user has two simultaneous meetings at different locations
 * @param userMatches
 * @param userMatchesWithMeetingInfo
 * @param startTime
 * @param userMatchLocations
 *!/
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
        
        // @ts-expect-error fixme: auto ignored
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
        
        // @ts-expect-error fixme: auto ignored
        match.meetingInfo.date.getTime() ===
          
          // @ts-expect-error fixme: auto ignored
          userMatchWithMeetingInfo.meetingInfo.date.getTime() &&
        match.meetingInfo.location !==
          userMatchWithMeetingInfo.meetingInfo.location,
    );
    const crashingReceiverMatch = userMatchesWithMeetingInfo.find(
      (match) =>
        match.receiverId === userMatchWithMeetingInfo.receiverId &&
        match.senderId !== userMatchWithMeetingInfo.senderId &&
        
        // @ts-expect-error fixme: auto ignored
        match.meetingInfo.date.getTime() ===
          
          // @ts-expect-error fixme: auto ignored
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

/!**
 *
 * @param matches matches generated from matchFinder
 * @param usersGroupedByMembership a map of group memberships for each user
 * @param standLocation the location of the stand
 * @param userMatchLocations the allowed locations for user matches, optionally with a limit on how many simultaneous matches can fit there
 * @param startTime the first allowed meeting time
 * @param meetingDurationInMS the estimated duration of the meeting
 *!/
function assignMeetingInfoToMatches(
  [userMatches, standMatches]: [CandidateUserMatch[], CandidateStandMatch[]],
  usersGroupedByMembership: Map<string, string[]>,
  standLocation: string,
  userMatchLocations: MatchLocation[],
  startTime: Date,
  meetingDurationInMS: number,
): [UserMatch[], StandMatch[]] {
  // Goal:
  /!**
   * We can simplify for now, and just set up a table in the frontend for this Ullern case since we have little time
   * Distribute all users evenly among meetingPoints at
   * Class pairs meet at the same time
   * Stand is visited after matches, based on memberships
   * fixme: implement this in the future
   *!/
  logger.debug("\nAssigning meeting info to matches");
  let groupStartTime = startTime;
  for (const [groupMembership, users] of usersGroupedByMembership.entries()) {
    logger.debug(
      `${groupMembership} will meet at ${moment(groupMembership).format("hh:mm")}`,
    );
    for (const user of users) {
      const theirUserMatches = userMatches.filter(
        (userMatch) =>
          userMatch.customerA === user || userMatch.customerB === user,
      );
      const theirStandMatch = standMatches.find(
        (standMatch) => standMatch.customer === user,
      );
    }
    groupStartTime = new Date(groupStartTime.getTime() + meetingDurationInMS);
  }
  const sendersWithMatches = groupMatchesBySender(userMatches);

  const userMeetingTimes: Record<string, Date[]> = userMatches.reduce(
    (accumulator, userMatch) => ({
      ...accumulator,
      [userMatch.customerA]: [],
      [userMatch.customerB]: [],
    }),
    {},
  );

  const locationMeetingTimes: Record<string, Date[]> = Object.fromEntries(
    userMatchLocations.map((location) => [location.name, []]),
  );

  let locationIndex = 0;
  const userMatchesWithMeetingInfo: UserMatchWithMeetingInfo[] = [];

  for (const senderWithMatches of sendersWithMatches) {
    const location = userMatchLocations[locationIndex];
    locationIndex = (locationIndex + 1) % userMatchLocations.length;

    if (!location) {
      throw new BlError("Location not found when assigning match meeting info");
    }
    const meetingTimes = locationMeetingTimes[location.name];
    if (!meetingTimes) {
      throw new BlError(
        "Location meeting times not found when assigning match meeting info",
      );
    }

    const earliestLocationTime = findEarliestLocationTime(
      location,
      meetingTimes,
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

    
    // @ts-expect-error fixme: auto ignored
    userMeetingTimes[senderWithMatches.senderId].push(earliestPossibleTime);
    
    // @ts-expect-error fixme: auto ignored
    locationMeetingTimes[location.name].push(earliestPossibleTime);
    for (const match of senderWithMatches.matches) {
      
      // @ts-expect-error fixme: auto ignored
      userMeetingTimes[match.receiverId].push(earliestPossibleTime);

      userMatchesWithMeetingInfo.push({
        ...match,
        meetingInfo: {
          
          // @ts-expect-error fixme: auto ignored
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
              return Math.max(potentialTime, latestTime);
            }, startTime.getTime()),
        ),
      },
    }));

  verifyStandMatches(standMatchesWithMeetingInfo, standLocation);

  return [...userMatchesWithMeetingInfo, ...standMatchesWithMeetingInfo];
}

export default assignMeetingInfoToMatches;
*/
