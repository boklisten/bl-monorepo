import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { MatchFinder } from "@backend/collections/match/helpers/match-finder-2/match-finder";
import assignMeetingInfoToMatches from "@backend/collections/match/helpers/match-finder-2/match-meeting-info";
import { matchSchema } from "@backend/collections/match/match.schema";
import {
  candidateMatchToMatch,
  getMatchableReceivers,
  getMatchableSenders,
  MatcherSpec,
} from "@backend/collections/match/operations/match-generate-operation-helper";
import { orderSchema } from "@backend/collections/order/order.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Match } from "@shared/match/match";
import { Order } from "@shared/order/order";
import { fromError } from "zod-validation-error";

export class MatchGenerateOperation implements Operation {
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _matchStorage: BlDocumentStorage<Match>;
  private readonly _orderStorage: BlDocumentStorage<Order>;

  constructor(
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    matchStorage?: BlDocumentStorage<Match>,
    orderStorage?: BlDocumentStorage<Order>,
  ) {
    this._customerItemStorage = customerItemStorage
      ? customerItemStorage
      : new BlDocumentStorage(
          BlCollectionName.CustomerItems,
          customerItemSchema,
        );
    this._matchStorage = matchStorage
      ? matchStorage
      : new BlDocumentStorage(BlCollectionName.Matches, matchSchema);
    this._orderStorage = orderStorage
      ? orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = MatcherSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    const [senders, receivers] = await Promise.all([
      getMatchableSenders(
        parsedRequest.data.senderBranches,
        parsedRequest.data.deadlineBefore,
        parsedRequest.data.includeSenderItemsFromOtherBranches,
        this._customerItemStorage,
      ),
      getMatchableReceivers(
        parsedRequest.data.receiverBranches,
        this._orderStorage,
        parsedRequest.data.additionalReceiverItems,
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
