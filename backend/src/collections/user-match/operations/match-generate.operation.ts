import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
import { MatchFinder } from "@backend/collections/user-match/helpers/match-finder/match-finder";
import assignMeetingInfoToMatches from "@backend/collections/user-match/helpers/match-finder/match-meeting-info";
import {
  candidateMatchToMatch,
  getMatchableReceivers,
  getMatchableSenders,
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
import { fromError } from "zod-validation-error";

export class MatchGenerateOperation implements Operation {
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _userMatchStorage: BlDocumentStorage<UserMatch>;
  private readonly _standMatchStorage: BlDocumentStorage<StandMatch>;
  private readonly _orderStorage: BlDocumentStorage<Order>;

  constructor(
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    userMatchStorage?: BlDocumentStorage<UserMatch>,
    standMatchStorage?: BlDocumentStorage<StandMatch>,
    orderStorage?: BlDocumentStorage<Order>,
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
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatchGenerateSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    const [senders, receivers] = await Promise.all([
      getMatchableSenders(
        parsedRequest.data.branches,
        parsedRequest.data.deadlineBefore,
        parsedRequest.data.includeCustomerItemsFromOtherBranches,
        this._customerItemStorage,
        this._orderStorage,
      ),
    ]);
    if (senders.length === 0 && receivers.length === 0) {
      throw new BlError("No senders or receivers");
    }
    const matches = assignMeetingInfoToMatches(
      new MatchFinder(senders, receivers).generateMatches(),
      parsedRequest.data.standLocation,
      parsedRequest.data.userMatchLocations,
      new Date(parsedRequest.data.startTime),
      parsedRequest.data.matchMeetingDurationInMS,
    ).map((candidate) =>
      candidateMatchToMatch(candidate, parsedRequest.data.deadlineOverrides),
    );
    if (matches.length === 0) {
      throw new BlError("No matches generated");
    }

    const res = await this._matchStorage.addMany(matches);
    return new BlapiResponse(res.map((r) => r.id));
  }
}
