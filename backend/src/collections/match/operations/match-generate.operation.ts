import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { MatchFinder } from "@backend/collections/match/helpers/match-finder-2/match-finder";
import assignMeetingInfoToMatches from "@backend/collections/match/helpers/match-finder-2/match-meeting-info";
import { matchSchema } from "@backend/collections/match/match.schema";
import {
  candidateMatchToMatch,
  getMatchableReceivers,
  getMatchableSenders,
  verifyMatcherSpec,
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
    const matcherSpec = blApiRequest.data;
    if (!verifyMatcherSpec(matcherSpec)) {
      throw new BlError(`Malformed MatcherSpec`).code(701);
    }
    const [senders, receivers] = await Promise.all([
      getMatchableSenders(
        matcherSpec.senderBranches,
        matcherSpec.deadlineBefore,
        matcherSpec.includeSenderItemsFromOtherBranches,
        this._customerItemStorage,
      ),
      getMatchableReceivers(
        matcherSpec.receiverBranches,
        this._orderStorage,
        matcherSpec.additionalReceiverItems,
      ),
    ]);
    if (senders.length === 0 && receivers.length === 0) {
      throw new BlError("No senders or receivers");
    }
    const matches = assignMeetingInfoToMatches(
      new MatchFinder(senders, receivers).generateMatches(),
      matcherSpec.standLocation,
      matcherSpec.userMatchLocations,
      new Date(matcherSpec.startTime),
      matcherSpec.matchMeetingDurationInMS,
    ).map((candidate) =>
      candidateMatchToMatch(candidate, matcherSpec.deadlineOverrides),
    );
    if (matches.length === 0) {
      throw new BlError("No matches generated");
    }

    const res = await this._matchStorage.addMany(matches);
    return new BlapiResponse(res.map((r) => r.id));
  }
}
