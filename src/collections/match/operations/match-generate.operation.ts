import {
  BlapiResponse,
  BlError,
  CustomerItem,
  Match,
  Order,
} from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { customerItemSchema } from "@/collections/customer-item/customer-item.schema";
import { MatchFinder } from "@/collections/match/helpers/match-finder-2/match-finder";
import assignMeetingInfoToMatches from "@/collections/match/helpers/match-finder-2/match-meeting-info";
import { matchSchema } from "@/collections/match/match.schema";
import {
  candidateMatchToMatch,
  getMatchableReceivers,
  getMatchableSenders,
  verifyMatcherSpec,
} from "@/collections/match/operations/match-generate-operation-helper";
import { orderSchema } from "@/collections/order/order.schema";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

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
