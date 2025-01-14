import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { MatchFinder } from "@backend/collections/user-match/helpers/match-finder/match-finder";
import {
  getMatchableUsers,
  MatchGenerateSpec,
} from "@backend/collections/user-match/operations/match-generate-operation-helper";
import { userMatchSchema } from "@backend/collections/user-match/user-match.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { StandMatch } from "@shared/match/stand-match";
import { UserMatch } from "@shared/match/user-match";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { fromError } from "zod-validation-error";

export class MatchGenerateOperation implements Operation {
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _userMatchStorage: BlDocumentStorage<UserMatch>;
  private readonly _standMatchStorage: BlDocumentStorage<StandMatch>;
  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    userMatchStorage?: BlDocumentStorage<UserMatch>,
    standMatchStorage?: BlDocumentStorage<StandMatch>,
    orderStorage?: BlDocumentStorage<Order>,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._customerItemStorage =
      customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
    this._userMatchStorage =
      userMatchStorage ??
      new BlDocumentStorage(BlCollectionName.UserMatches, userMatchSchema);
    this._standMatchStorage =
      standMatchStorage ??
      new BlDocumentStorage(BlCollectionName.StandMatches, standMatchSchema);
    this._orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchGenerateSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    const matchableUsers = await getMatchableUsers(
      parsedRequest.data.branches,
      parsedRequest.data.deadlineBefore,
      parsedRequest.data.includeCustomerItemsFromOtherBranches,
      this._customerItemStorage,
      this._orderStorage,
      this._userDetailStorage,
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
      parsedRequest.data.standLocation,
      parsedRequest.data.userMatchLocations,
      new Date(parsedRequest.data.startTime),
      parsedRequest.data.matchMeetingDurationInMS,
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
          location: parsedRequest.data.standLocation,
          date: new Date("2025-01-17T10:45:00Z"),
        },
      }),
    );

    if (userMatches.length === 0 && standMatches.length === 0) {
      throw new BlError("No matches generated");
    }

    const addedUserMatches = await this._userMatchStorage.addMany(userMatches);
    const addedStandMatches =
      await this._standMatchStorage.addMany(standMatches);
    return new BlapiResponse([
      {
        status: `Created ${addedUserMatches.length} user matches and ${addedStandMatches.length} stand matches`,
      },
    ]);
  }
}
