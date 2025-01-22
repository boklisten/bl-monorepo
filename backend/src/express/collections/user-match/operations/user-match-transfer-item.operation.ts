import { CustomerItemActiveBlid } from "@backend/express/collections/customer-item/helpers/customer-item-active-blid.js";
import { OrderToCustomerItemGenerator } from "@backend/express/collections/customer-item/helpers/order-to-customer-item-generator.js";
import { OrderItemMovedFromOrderHandler } from "@backend/express/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler.js";
import { OrderValidator } from "@backend/express/collections/order/helpers/order-validator/order-validator.js";
import {
  createMatchDeliverOrder,
  createMatchReceiveOrder,
} from "@backend/express/collections/user-match/operations/user-match-operation-utils.js";
import { isNullish } from "@backend/express/helper/typescript-helpers.js";
import { SEDbQuery } from "@backend/express/query/se.db-query.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { StandMatch } from "@shared/match/stand-match.js";
import { UserMatch } from "@shared/match/user-match.js";
import { Order } from "@shared/order/order.js";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class UserMatchTransferItemOperation implements Operation {
  private readonly wrongSenderFeedback = `Boken du skannet tilhørte en annen elev enn den som ga deg den. Du skal beholde den, men eleven som ga deg boken er fortsatt ansvarlig for at den opprinnelige boken blir levert.`;

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
      await BlStorage.UserMatches.update(senderUserMatch.id, update);
      return;
    }

    if (senderStandMatch === undefined) {
      return;
    }

    await BlStorage.StandMatches.update(senderStandMatch.id, {
      deliveredItems: [...senderStandMatch.deliveredItems, customerItem.item],
    });
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
        ? receiverUserMatch.receivedBlIdsCustomerA
        : receiverUserMatch.receivedBlIdsCustomerB;

    if (receivedBlIds.includes(customerItem?.blid ?? "")) {
      throw new BlError("Receiver has already received this item").code(806);
    }

    const receivedItemIds = await Promise.all(
      receivedBlIds.map(async (blId) => {
        const uniqueItemQuery = new SEDbQuery();
        uniqueItemQuery.stringFilters = [{ fieldName: "blid", value: blId }];
        return (await BlStorage.UniqueItems.getByQuery(uniqueItemQuery))[0]
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
    );

    const placedReceiverOrder = await BlStorage.Orders.add(receiverOrder);

    await new OrderValidator().validate(placedReceiverOrder, false);

    const orderMovedToHandler = new OrderItemMovedFromOrderHandler();
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

    const addedCustomerItem = await BlStorage.CustomerItems.add(
      generatedReceiverCustomerItem,
    );

    await BlStorage.Orders.update(placedReceiverOrder.id, {
      orderItems: placedReceiverOrder.orderItems.map((orderItem) => ({
        ...orderItem,
        customerItem: addedCustomerItem.id,
      })),
    });
  }

  private async returnSenderCustomerItem(
    customerItem: CustomerItem,
  ): Promise<void> {
    const senderOrder = await createMatchDeliverOrder(
      customerItem,
      customerItem.customer,
    );

    const placedSenderOrder = await BlStorage.Orders.add(senderOrder);
    await new OrderValidator().validate(placedSenderOrder, false);

    await BlStorage.CustomerItems.update(customerItem.id, {
      returned: true,
    });
  }

  private async getUserMatchesForCustomer(
    customer: string,
  ): Promise<UserMatch[]> {
    return (await BlStorage.UserMatches.aggregate([
      {
        $match: {
          $or: [
            { customerA: new ObjectId(customer) },
            { customerB: new ObjectId(customer) },
          ],
        },
      },
    ])) as UserMatch[];
  }

  private async getStandMatchForCustomer(
    customer: string,
  ): Promise<StandMatch | undefined> {
    const standMatches = (await BlStorage.StandMatches.aggregate([
      {
        $match: {
          customer: new ObjectId(customer),
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
    await BlStorage.UserMatches.update(receiverUserMatch.id, update);
  }
}
