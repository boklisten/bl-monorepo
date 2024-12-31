import { SystemUser } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator";
import { itemSchema } from "@backend/collections/item/item.schema";
import { matchSchema } from "@backend/collections/match/match.schema";
import {
  createMatchDeliverOrder,
  createMatchReceiveOrder,
  getAllMatchesForUser,
} from "@backend/collections/match/operations/match-operation-utils";
import { OrderItemMovedFromOrderHandler } from "@backend/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { orderSchema } from "@backend/collections/order/order.schema";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";
import { isNullish } from "@backend/helper/typescript-helpers";
import { Operation } from "@backend/operation/operation";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Branch } from "@shared/branch/branch";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Item } from "@shared/item/item";
import { Match, MatchVariant, UserMatch } from "@shared/match/match";
import { Order } from "@shared/order/order";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class MatchTransferItemOperation implements Operation {
  private readonly wrongSenderFeedback = `Boken du skannet tilhørte en annen elev enn den som ga deg den. Du skal beholde den, men eleven som ga deg boken er fortsatt ansvarlig for at den opprinnelige boken blir levert.`;

  private readonly _matchStorage: BlDocumentStorage<Match>;
  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _uniqueItemStorage: BlDocumentStorage<UniqueItem>;
  private readonly _branchStorage: BlDocumentStorage<Branch>;
  private readonly _itemStorage: BlDocumentStorage<Item>;

  constructor(
    matchStorage?: BlDocumentStorage<Match>,
    orderStorage?: BlDocumentStorage<Order>,
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    branchStorage?: BlDocumentStorage<Branch>,
    itemStorage?: BlDocumentStorage<Item>,
  ) {
    this._matchStorage =
      matchStorage ??
      new BlDocumentStorage(BlCollectionName.Matches, matchSchema);
    this._orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this._customerItemStorage =
      customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
    this._uniqueItemStorage =
      uniqueItemStorage ??
      new BlDocumentStorage(BlCollectionName.UniqueItems, uniqueItemSchema);
    this._branchStorage =
      branchStorage ??
      new BlDocumentStorage(BlCollectionName.Branches, branchSchema);
    this._itemStorage =
      itemStorage ?? new BlDocumentStorage(BlCollectionName.Items, itemSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    let userFeedback;
    const { blid, receiverUserDetailId } =
      this.extractRequestData(blApiRequest);

    const customerItem = await this.getActiveCustomerItem(blid);
    const receiverUserMatch = await this.findReceiverUserMatch(
      receiverUserDetailId,
      customerItem,
    );
    const { allSenderMatches, senderUserMatch } =
      await this.findSenderUserMatch(customerItem);

    if (
      isNullish(senderUserMatch) ||
      receiverUserMatch.id !== senderUserMatch.id
    ) {
      userFeedback = this.wrongSenderFeedback;
    }

    await this.returnSenderCustomerItem(customerItem);
    const placedReceiverOrder = await this.placeReceiverOrder(
      customerItem,
      receiverUserDetailId,
      receiverUserMatch,
    );
    await this.recordReceiverCustomerItem(placedReceiverOrder);
    await this.updateReceiverUserMatch(receiverUserMatch, customerItem);
    await this.updateSenderMatches(
      customerItem,
      senderUserMatch,
      allSenderMatches,
    );

    return new BlapiResponse([{ feedback: userFeedback }]);
  }

  private isValidBlid(scannedText: string): boolean {
    if (Number.isNaN(Number(scannedText))) {
      if (scannedText.length === 12) {
        return true;
      }
    } else if (scannedText.length === 8) {
      return true;
    }
    return false;
  }

  private extractRequestData(blApiRequest: BlApiRequest): {
    blid: string;
    receiverUserDetailId: string;
  } {
    const parsedRequest = z
      .object({ blid: z.string() })
      .safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    if (!this.isValidBlid(parsedRequest.data.blid)) {
      throw new BlError("blid is not a valid blid").code(803);
    }

    const receiverUserDetailId = blApiRequest.user?.details ?? "";
    return { blid: parsedRequest.data.blid, receiverUserDetailId };
  }

  private async updateSenderMatches(
    customerItem: CustomerItem,
    senderUserMatch: UserMatch | undefined,
    allSenderMatches: Match[],
  ): Promise<void> {
    if (senderUserMatch !== undefined) {
      await this._matchStorage.update(
        senderUserMatch.id,
        {
          deliveredBlIds: [
            ...senderUserMatch.deliveredBlIds,
            customerItem?.blid ?? "",
          ],
        },
        new SystemUser(),
      );
      return;
    }

    const senderStandMatch = allSenderMatches
      .filter((match) => match._variant === MatchVariant.StandMatch)
      .find(
        (standMatch) =>
          standMatch.expectedHandoffItems.includes(customerItem.item) &&
          !standMatch.deliveredItems.includes(customerItem?.blid ?? ""),
      );

    if (senderStandMatch === undefined) {
      return;
    }

    await this._matchStorage.update(
      senderStandMatch.id,
      {
        deliveredItems: [...senderStandMatch.deliveredItems, customerItem.item],
      },
      new SystemUser(),
    );
  }

  private async findReceiverUserMatch(
    receiverUserDetailId: string,
    customerItem: CustomerItem,
  ): Promise<UserMatch> {
    const receiverUserMatch = (
      await this.getReceiverUserMatches(receiverUserDetailId)
    ).find((userMatch) => userMatch.expectedItems.includes(customerItem.item));

    if (!receiverUserMatch) {
      throw new BlError("Item not in receiver expectedItems").code(805);
    }

    if (receiverUserMatch.receivedBlIds.includes(customerItem?.blid ?? "")) {
      throw new BlError("Receiver has already received this item").code(806);
    }

    const receivedItemIds = await Promise.all(
      receiverUserMatch.receivedBlIds.map(async (blId) => {
        const uniqueItemQuery = new SEDbQuery();
        uniqueItemQuery.stringFilters = [{ fieldName: "blid", value: blId }];
        return (await this._uniqueItemStorage.getByQuery(uniqueItemQuery))[0]
          ?.item;
      }),
    );

    if (receivedItemIds.includes(customerItem.item)) {
      throw new BlError("Receiver has already received this item").code(806);
    }
    return receiverUserMatch;
  }

  private async findSenderUserMatch(customerItem: CustomerItem): Promise<{
    allSenderMatches: Match[];
    senderUserMatch: UserMatch | undefined;
  }> {
    const allSenderMatches = await getAllMatchesForUser(
      customerItem.customer,
      this._matchStorage,
    );
    const senderUserMatches = allSenderMatches.filter(
      (match) => match._variant === MatchVariant.UserMatch,
    );
    const senderUserMatch = senderUserMatches.find(
      (userMatch) =>
        userMatch.expectedItems.includes(customerItem.item) &&
        !userMatch.deliveredBlIds.includes(customerItem?.blid ?? ""),
    );
    return { allSenderMatches: allSenderMatches, senderUserMatch };
  }

  private async placeReceiverOrder(
    customerItem: CustomerItem,
    receiverUserDetailId: string,
    receiverUserMatch: UserMatch,
  ): Promise<Order> {
    const receiverOrder = await createMatchReceiveOrder(
      customerItem,
      receiverUserDetailId,
      this._itemStorage,
      this._branchStorage,
      receiverUserMatch.deadlineOverrides,
    );

    const placedReceiverOrder = await this._orderStorage.add(
      receiverOrder,
      new SystemUser(),
    );

    await new OrderValidator().validate(placedReceiverOrder, false);

    const orderMovedToHandler = new OrderItemMovedFromOrderHandler(
      this._orderStorage,
    );
    await orderMovedToHandler.updateOrderItems(placedReceiverOrder);
    return placedReceiverOrder;
  }

  private async recordReceiverCustomerItem(
    placedReceiverOrder: Order,
  ): Promise<void> {
    const [generatedReceiverCustomerItem] =
      await new OrderToCustomerItemGenerator().generate(placedReceiverOrder);

    if (generatedReceiverCustomerItem === undefined) {
      throw new BlError("Failed to create new customer items");
    }

    const addedCustomerItem = await this._customerItemStorage.add(
      generatedReceiverCustomerItem,
      new SystemUser(),
    );

    await this._orderStorage.update(
      placedReceiverOrder.id,
      {
        orderItems: placedReceiverOrder.orderItems.map((orderItem) => ({
          ...orderItem,
          customerItem: addedCustomerItem.id,
        })),
      },
      new SystemUser(),
    );
  }

  private async returnSenderCustomerItem(
    customerItem: CustomerItem,
  ): Promise<void> {
    const senderOrder = await createMatchDeliverOrder(
      customerItem,
      customerItem.customer,
      this._itemStorage,
      this._branchStorage,
    );

    const placedSenderOrder = await this._orderStorage.add(
      senderOrder,
      new SystemUser(),
    );
    await new OrderValidator().validate(placedSenderOrder, false);

    await this._customerItemStorage.update(
      customerItem.id,
      {
        returned: true,
      },
      new SystemUser(),
    );
  }

  private async getReceiverUserMatches(
    receiverUserDetailId: string,
  ): Promise<UserMatch[]> {
    const receiverUserMatches = (
      await getAllMatchesForUser(receiverUserDetailId, this._matchStorage)
    ).filter((match) => match._variant === MatchVariant.UserMatch);

    if (receiverUserMatches.length === 0) {
      throw new BlError("Receiver does not have any user matches");
    }
    return receiverUserMatches;
  }

  private async getActiveCustomerItem(blid: string) {
    const [customerItem] = await new CustomerItemActiveBlid()
      .getActiveCustomerItems(blid)
      .catch(() => {
        throw new BlError("blid not active").code(804);
      });
    if (!customerItem) {
      throw new BlError("blid not active").code(804);
    }
    return customerItem;
  }

  private async updateReceiverUserMatch(
    receiverUserMatch: UserMatch,
    customerItem: CustomerItem,
  ): Promise<void> {
    await this._matchStorage.update(
      receiverUserMatch.id,
      {
        // We know there's a blid because we found the CustomerItem by blid
        receivedBlIds: [
          ...receiverUserMatch.receivedBlIds,
          customerItem?.blid ?? "",
        ],
      },
      new SystemUser(),
    );
  }
}
