import { SystemUser } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator";
import { itemSchema } from "@backend/collections/item/item.schema";
import { OrderItemMovedFromOrderHandler } from "@backend/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { orderSchema } from "@backend/collections/order/order.schema";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";
import {
  createMatchDeliverOrder,
  createMatchReceiveOrder,
} from "@backend/collections/user-match/operations/user-match-operation-utils";
import { userMatchSchema } from "@backend/collections/user-match/user-match.schema";
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
import { StandMatch } from "@shared/match/stand-match";
import { UserMatch } from "@shared/match/user-match";
import { Order } from "@shared/order/order";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class UserMatchTransferItemOperation implements Operation {
  private readonly wrongSenderFeedback = `Boken du skannet tilhørte en annen elev enn den som ga deg den. Du skal beholde den, men eleven som ga deg boken er fortsatt ansvarlig for at den opprinnelige boken blir levert.`;

  private readonly _userMatchStorage: BlDocumentStorage<UserMatch>;
  private readonly _standMatchStorage: BlDocumentStorage<StandMatch>;
  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _uniqueItemStorage: BlDocumentStorage<UniqueItem>;
  private readonly _branchStorage: BlDocumentStorage<Branch>;
  private readonly _itemStorage: BlDocumentStorage<Item>;

  constructor(
    userMatchStorage?: BlDocumentStorage<UserMatch>,
    standMatchStorage?: BlDocumentStorage<StandMatch>,
    orderStorage?: BlDocumentStorage<Order>,
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    branchStorage?: BlDocumentStorage<Branch>,
    itemStorage?: BlDocumentStorage<Item>,
  ) {
    this._userMatchStorage =
      userMatchStorage ??
      new BlDocumentStorage(BlCollectionName.UserMatches, userMatchSchema);
    this._standMatchStorage =
      standMatchStorage ??
      new BlDocumentStorage(BlCollectionName.StandMatches, standMatchSchema);
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
    const { senderStandMatch, senderUserMatch } =
      await this.findSenderMatch(customerItem);

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
    );
    await this.recordReceiverCustomerItem(placedReceiverOrder);
    await this.updateReceiverUserMatch(
      receiverUserMatch,
      customerItem,
      receiverUserDetailId,
    );
    await this.updateSenderMatches(
      customerItem,
      senderUserMatch,
      senderStandMatch,
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
    senderStandMatch: StandMatch | undefined,
  ): Promise<void> {
    if (senderUserMatch !== undefined) {
      let update: Partial<UserMatch>;
      if (senderUserMatch.customerA === customerItem.customer) {
        update = {
          deliveredBlIdsCustomerA: [
            ...senderUserMatch.deliveredBlIdsCustomerA,
            customerItem?.blid ?? "",
          ],
        };
      } else {
        update = {
          deliveredBlIdsCustomerB: [
            ...senderUserMatch.deliveredBlIdsCustomerB,
            customerItem?.blid ?? "",
          ],
        };
      }
      await this._userMatchStorage.update(
        senderUserMatch.id,
        update,
        new SystemUser(),
      );
      return;
    }

    if (senderStandMatch === undefined) {
      return;
    }

    await this._standMatchStorage.update(
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
      await this.getUserMatchesForCustomer(receiverUserDetailId)
    ).find(
      (userMatch) =>
        (userMatch.customerA === receiverUserDetailId &&
          userMatch.expectedBToAItems.includes(customerItem.item)) ||
        (userMatch.customerB === receiverUserDetailId &&
          userMatch.expectedAToBItems.includes(customerItem.item)),
    );

    if (!receiverUserMatch) {
      throw new BlError("Could not find a matching receiver user match").code(
        805,
      );
    }

    const receivedBlIds =
      receiverUserMatch.customerA === receiverUserDetailId
        ? receiverUserMatch.expectedBToAItems
        : receiverUserMatch.expectedAToBItems;

    if (receivedBlIds.includes(customerItem?.blid ?? "")) {
      throw new BlError("Receiver has already received this item").code(806);
    }

    const receivedItemIds = await Promise.all(
      receivedBlIds.map(async (blId) => {
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

  private async findSenderMatch(customerItem: CustomerItem): Promise<{
    senderUserMatch: UserMatch | undefined;
    senderStandMatch: StandMatch | undefined;
  }> {
    const senderUserMatches = await this.getUserMatchesForCustomer(
      customerItem.customer,
    );
    const senderUserMatch = senderUserMatches.find(
      (userMatch) =>
        (userMatch.customerB === customerItem.customer &&
          userMatch.expectedBToAItems.includes(customerItem.item)) ||
        (userMatch.customerA === customerItem.customer &&
          userMatch.expectedAToBItems.includes(customerItem.item)),
    );

    const potentialSenderStandMatch = await this.getStandMatchForCustomer(
      customerItem.customer,
    );
    const senderStandMatch =
      potentialSenderStandMatch?.expectedHandoffItems.includes(
        customerItem.item,
      )
        ? potentialSenderStandMatch
        : undefined;
    return { senderUserMatch, senderStandMatch };
  }

  private async placeReceiverOrder(
    customerItem: CustomerItem,
    receiverUserDetailId: string,
  ): Promise<Order> {
    const receiverOrder = await createMatchReceiveOrder(
      customerItem,
      receiverUserDetailId,
      this._itemStorage,
      this._branchStorage,
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

  private async getUserMatchesForCustomer(
    customer: string,
  ): Promise<UserMatch[]> {
    const userMatches = (await this._userMatchStorage.aggregate([
      {
        $match: {
          $or: [
            { customerA: new ObjectId(customer) },
            { customerB: new ObjectId(customer) },
          ],
        },
      },
    ])) as UserMatch[];

    if (userMatches.length === 0) {
      throw new BlError("User does not have any user matches");
    }
    return userMatches;
  }

  private async getStandMatchForCustomer(
    customer: string,
  ): Promise<StandMatch | undefined> {
    const standMatches = (await this._standMatchStorage.aggregate([
      {
        $match: {
          $or: [
            { customerA: new ObjectId(customer) },
            { customerB: new ObjectId(customer) },
          ],
        },
      },
    ])) as StandMatch[];

    return standMatches[0];
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
    receiver: string,
  ): Promise<void> {
    let update: Partial<UserMatch>;
    if (receiverUserMatch.customerA === receiver) {
      update = {
        // We know there's a blid because we found the CustomerItem by blid
        receivedBlIdsCustomerA: [
          ...receiverUserMatch.receivedBlIdsCustomerA,
          customerItem?.blid ?? "",
        ],
      };
    } else {
      update = {
        // We know there's a blid because we found the CustomerItem by blid
        receivedBlIdsCustomerB: [
          ...receiverUserMatch.receivedBlIdsCustomerB,
          customerItem?.blid ?? "",
        ],
      };
    }
    await this._userMatchStorage.update(
      receiverUserMatch.id,
      update,
      new SystemUser(),
    );
  }
}
