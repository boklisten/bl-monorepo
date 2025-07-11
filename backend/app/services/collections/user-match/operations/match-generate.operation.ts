import vine from "@vinejs/vine";

import { MatchFinder } from "#services/collections/user-match/helpers/match-finder/match-finder";
import {
  getMatchableUsers,
  matchGenerateValidator,
} from "#services/collections/user-match/operations/match-generate-operation-helper";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { StandMatch } from "#shared/match/stand-match";
import { UserMatch } from "#shared/match/user-match";

export class MatchGenerateOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const {
      branches,
      standLocation,
      deadlineBefore,
      includeCustomerItemsFromOtherBranches,
    } = await vine.validate({
      schema: matchGenerateValidator,
      data: blApiRequest.data,
    });

    const matchableUsers = await getMatchableUsers(
      branches,
      deadlineBefore,
      includeCustomerItemsFromOtherBranches,
    );
    if (matchableUsers.length === 0) {
      throw new BlError("No matchable users found");
    }
    /*
    const usersGroupedByMembership = new Map<string, string[]>();
    for (const user of matchableUsers) {
      const existingGroup = usersGroupedByMembership.get(user.groupMembership);
      if (existingGroup) {
        existingGroup.push(user.id);
      } else {
        usersGroupedByMembership.set(user.groupMembership, [user.id]);
      }
    }
    const [userMatches, standMatches] = assignMeetingInfoToMatches(
      new MatchFinder(matchableUsers).generateMatches(),
      usersGroupedByMembership,
      standLocation,
      userMatchLocations,
      new Date(startTime),
      matchMeetingDurationInMS,
    );
     */
    const membershipToTime = {
      "1STA+2MK": new Date("2025-01-17T10:40:00Z"),
      "1STB+1STC": new Date("2025-01-17T10:45:00Z"),
      "1STD+1STG": new Date("2025-01-17T10:50:00Z"),
      "1STE+1STH": new Date("2025-01-17T10:55:00Z"),
    };
    const [candidateUserMatches, candidateStandMatches] = new MatchFinder(
      matchableUsers,
    ).generateMatches();
    const userMatches: UserMatch[] = candidateUserMatches.map(
      (candidateUserMatch) => ({
        ...candidateUserMatch,
        id: "",
        expectedAToBItems: Array.from(candidateUserMatch.expectedAToBItems),
        expectedBToAItems: Array.from(candidateUserMatch.expectedBToAItems),
        receivedBlIdsCustomerA: [],
        deliveredBlIdsCustomerA: [],
        receivedBlIdsCustomerB: [],
        deliveredBlIdsCustomerB: [],
        itemsLockedToMatch: true,
        meetingInfo: {
          location: "Krøllalfaen",
          date: membershipToTime[
            // @ts-expect-error fixme: auto ignored : temporary for this round of matching (jan 2025)
            matchableUsers.find((u) => u.id === candidateUserMatch.customerA)
              ?.groupMembership
          ],
        },
      }),
    );
    const standMatches: StandMatch[] = candidateStandMatches.map(
      (candidateStandMatch) => ({
        ...candidateStandMatch,
        id: "",
        expectedHandoffItems: Array.from(
          candidateStandMatch.expectedHandoffItems,
        ),
        expectedPickupItems: Array.from(
          candidateStandMatch.expectedPickupItems,
        ),
        receivedItems: [],
        deliveredItems: [],
        meetingInfo: {
          location: standLocation,
          date: new Date("2025-01-17T10:45:00Z"),
        },
      }),
    );

    if (userMatches.length === 0 && standMatches.length === 0) {
      throw new BlError("No matches generated");
    }

    const addedUserMatches = await BlStorage.UserMatches.addMany(userMatches);
    const addedStandMatches =
      await BlStorage.StandMatches.addMany(standMatches);
    return new BlapiResponse([
      {
        status: `Created ${addedUserMatches.length} user matches and ${addedStandMatches.length} stand matches`,
      },
    ]);
  }
}
