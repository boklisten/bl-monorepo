/*
fixme: rewrite

import { MatchFinder } from "#services/collections/user-match/helpers/match-finder/match-finder";
import assignMeetingInfoToMatches from "#services/collections/user-match/helpers/match-finder/match-meeting-info";
import {
  createFakeMatchableUser,
  createUserGroup,
  seededRandom,
  shuffler,
} from "#services/collections/user-match/helpers/match-finder/match-testing-utils";
import {
  CandidateMatchVariant,
  MatchableUser,
  MatchWithMeetingInfo,
} from "#services/collections/user-match/helpers/match-finder/match-types";
import otto_treider_test_users_year_0 from "#services/collections/user-match/helpers/match-finder/test-data/test_users_year_0.json";
import otto_treider_test_users_year_1 from "#services/collections/user-match/helpers/match-finder/test-data/test_users_year_1.json";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

import { test } from '@japa/runner'
chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

const audun = createFakeMatchableUser("audun", "Bulkeboka", "Sykling 2");
const siri = createFakeMatchableUser("siri", "Mykhetens leksikon", "Sykling 2");
const kristine = createFakeMatchableUser(
  "kristine",
  "Mykhetens leksikon",
  "Spirituell Spire",
);
const elRi = createFakeMatchableUser("elRi", "Spirituell Spire");

/!**
 * Prints data about how many matches each location has at each timeslot
 * @param matches matches that have been assigned a location and a timeslot
 *!/

// @ts-expect-error fixme: auto ignored 
function printLocationMetrics(matches: MatchWithMeetingInfo[]) {
  const aggregatedLocationInfo = matches 
    // @ts-expect-error fixme: auto ignored 
    .sort((a, b) => (a.meetingInfo.date > b.meetingInfo.date ? 1 : -1))
    .reduce((acc, match) => {
      const { location, date } = match.meetingInfo;
      return {
        ...acc,
        [location]: {
          
          // @ts-expect-error fixme: auto ignored 
          ...acc[location],

          count:
            // @ts-expect-error fixme: auto ignored 
            acc[location]?.count === undefined ? 1 : acc[location].count + 1,
          [String(date)]:
            
            // @ts-expect-error fixme: auto ignored 
            acc[location]?.[String(date)] === undefined
              ? 1
              : 
                // @ts-expect-error fixme: auto ignored 
                acc[location][String(date)] + 1,
        },
      };
    }, {});
  console.log(aggregatedLocationInfo);
}

test.group("Simple Matches", async () => {
  test("should be able to assign non overlapping time a simple match setup", async () => {
    const matchFinder = new MatchFinder([audun, kristine], [siri, elRi]);
    const matches = matchFinder.generateMatches();
    const standLocation = "Resepsjonen";
    // Fails if match verification throws an error
    assignMeetingInfoToMatches(
      matches,
      standLocation,
      [{ name: "Sal 1" }, { name: "Sal 2" }],
      new Date("2023-02-02T12:00:00+0100"),
      900000, // 15 minutes
    );
  });

  test("should assign users to a stand match time slot right after their final match", async () => {
    const matchFinder = new MatchFinder([audun, kristine], [siri]);
    const matches = matchFinder.generateMatches();
    const standLocation = "Resepsjonen";
    const meetingDuration = 900000; // 15 minutes
    const matchesWithMeetingInfo = assignMeetingInfoToMatches(
      matches,
      standLocation,
      [{ name: "Sal 1" }, { name: "Sal 2" }],
      new Date("2024-06-12T12:00:00+0100"),
      meetingDuration,
    );
    for (const matchWithMeetingInfo of matchesWithMeetingInfo) {
      if (matchWithMeetingInfo.variant === CandidateMatchVariant.UserMatch)
        continue;
      const latestUserMatchForStandMatchCustomer = matchesWithMeetingInfo
        .filter(
          (match) =>
            match.variant === CandidateMatchVariant.UserMatch &&
            (match.senderId === matchWithMeetingInfo.userId ||
              match.receiverId === matchWithMeetingInfo.userId),
        )
        .reduce((latest, next) =>
          next.meetingInfo.date.getTime() > latest.meetingInfo.date.getTime()
            ? next
            : latest,
        );
      const latestUserMatchTime =
        latestUserMatchForStandMatchCustomer.meetingInfo.date.getTime();
      return expect( matchWithMeetingInfo.meetingInfo.date.getTime()).to.eq(
        latestUserMatchTime + meetingDuration,
      );
    }
  });

  test("should assign the StandMatch date to startTime if the user only has Stand Matches", async () => {
    const matchFinder = new MatchFinder([audun], [elRi]);
    const matches = matchFinder.generateMatches();
    const startTime = new Date("2024-06-12T12:00:00+0100");
    const matchesWithMeetingInfo = assignMeetingInfoToMatches(
      matches,
      "Resepsjonen",
      [{ name: "Sal 1" }, { name: "Sal 2" }],
      startTime,
      900000,
    );
    for (const matchWithMeetingInfo of matchesWithMeetingInfo) {
      return expect( matchWithMeetingInfo.meetingInfo.date.getTime()).to.eq(
        startTime.getTime(),
      );
    }
  });

  test("should not be able to be more matches than the location limit at a given time", async () => {
    const senders = createUserGroup("sender", 10, "A", "B", "C");
    const receivers = createUserGroup("receiver", 10, "A", "B", "C");
    const matchFinder = new MatchFinder(senders, receivers);
    const matches = matchFinder.generateMatches();
    const standLocation = "Resepsjonen";
    const simultaneousMatchLimit = 2;
    // Fails if match verification throws an error
    const updatedMatches = assignMeetingInfoToMatches(
      matches,
      standLocation,
      [{ name: "Sal 1", simultaneousMatchLimit }, { name: "Sal 2" }],
      new Date("2023-02-02T12:00:00+0100"),
      900000, // 15 minutes
    );
    const meetingTimes = updatedMatches
      .filter((match) => match.meetingInfo.location === "Sal 1")
      .map((match) => match.meetingInfo.date);

    const distinctMeetingTimes = Array.from(
      
      // @ts-expect-error fixme: auto ignored 
      new Set(meetingTimes.map((d) => d.getTime())),
    ).map((t) => new Date(t));

    for (const distinctMeetingTime of distinctMeetingTimes) {
      const simultaneousMatches = meetingTimes.filter(
        (meetingTime) =>
          
          // @ts-expect-error fixme: auto ignored 
          meetingTime.getTime() === distinctMeetingTime.getTime(),
      ).length;

      return expect( simultaneousMatches).to.be.lessThanOrEqual(simultaneousMatchLimit);
    }
  });
});

test.group("Large User Groups", async () => {
  test("should be able to assign non overlapping time with the Otto Treider test data", async () => {
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

    const matches = matchFinder.generateMatches();
    const standLocation = "Resepsjonen";
    // Fails if match verification throws an error
    assignMeetingInfoToMatches(
      matches,
      standLocation,
      [
        { name: "Hovedinngangen", simultaneousMatchLimit: 15 },
        { name: "Kantina", simultaneousMatchLimit: 20 },
        { name: "Fysikk-labben", simultaneousMatchLimit: 5 },
      ],
      new Date("2023-02-02T12:00:00+0100"),
      900000, // 15 minutes
    );
  });
});
*/
