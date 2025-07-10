import { z } from "zod";
import { fromError } from "zod-validation-error";

import { CustomerItemActiveBlid } from "#services/collections/customer-item/helpers/customer-item-active-blid";
import { OrderToCustomerItemGenerator } from "#services/collections/customer-item/helpers/order-to-customer-item-generator";
import { OrderActive } from "#services/collections/order/helpers/order-active/order-active";
import { OrderItemMovedFromOrderHandler } from "#services/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderValidator } from "#services/collections/order/helpers/order-validator/order-validator";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { UniqueItem } from "#shared/unique-item/unique-item";

const blidNotActiveFeedback =
  "Denne bliden er ikke tilknyttet noen bok. Registrer den i bl-admin for å dele den ut.";

export class RapidHandoutOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = z
      .object({ blid: z.string(), customerId: z.string() })
      .safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    if (!this.isValidBlid(parsedRequest.data.blid)) {
      throw new BlError("blid is not a valid blid").code(803);
    }
    const userFeedback = await this.verifyBlidNotActive(
      parsedRequest.data.blid,
      parsedRequest.data.customerId,
    );
    if (userFeedback) return new BlapiResponse([{ feedback: userFeedback }]);

    const uniqueItemOrFeedback = await this.verifyUniqueItemPresent(
      parsedRequest.data.blid,
    );
    if (typeof uniqueItemOrFeedback === "string")
      return new BlapiResponse([{ feedback: uniqueItemOrFeedback }]);

    const placedRentOrder = await this.placeRentOrder(
      parsedRequest.data.blid,
      uniqueItemOrFeedback.item,
      parsedRequest.data.customerId,
    );
    await this.createCustomerItem(placedRentOrder);

    return new BlapiResponse([{}]);
  }

  private async createCustomerItem(placedReceiverOrder: Order): Promise<void> {
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

  private async placeRentOrder(
    blid: string,
    itemId: string,
    customerId: string,
  ): Promise<Order> {
    const item = await BlStorage.Items.get(itemId);
    if (!item) {
      throw new BlError("Failed to get item");
    }

    interface OriginalOrderInfo {
      order: Order;
      relevantOrderItem: OrderItem | undefined;
    }
    const orderActive = new OrderActive();
    const customerOrder: OriginalOrderInfo | undefined = (
      await orderActive.getActiveOrders(customerId)
    )
      .map((order) => ({
        order,
        relevantOrderItem: order.orderItems.find(
          (orderItem) =>
            !orderItem.handout &&
            !orderItem.delivered &&
            !orderItem.movedToOrder &&
            orderItem.item === itemId &&
            (orderItem.type === "rent" || orderItem.type === "partly-payment"),
        ),
      }))
      .find(({ relevantOrderItem }) => relevantOrderItem !== undefined);

    if (!customerOrder) {
      throw new BlError("No customer order for rapid handout item").code(805);
    }
    const branch = await BlStorage.Branches.get(customerOrder.order.branch);

    const movedFromOrder = customerOrder.order.id;

    const originalOrderDeadline = customerOrder.relevantOrderItem?.info?.to;
    const branchRentDeadline = branch.paymentInfo?.rentPeriods?.[0]?.date;

    let deadline = originalOrderDeadline ?? branchRentDeadline;

    if (!deadline) {
      throw new BlError(
        "Cannot set deadline: no rent period for branch and no original order deadline",
      ).code(200);
    }
    // This is necessary because it's not actually a date in the database, and thus the type is wrong.
    // It might be solved in the future by Zod or some other strict parser/validation.
    deadline = new Date(deadline);

    const placedHandoutOrder = await BlStorage.Orders.add({
      placed: true,
      payments: [],
      amount: 0,
      branch: branch.id,
      customer: customerId,
      byCustomer: false,
      pendingSignature: false,
      orderItems: [
        {
          movedFromOrder,
          handout: true,
          item: itemId,
          title: item.title,
          blid,
          type: customerOrder.relevantOrderItem?.type ?? "rent",
          amount: 0,
          unitPrice: 0,
          taxRate: 0,
          taxAmount: 0,
          info: {
            from: new Date(),
            to: deadline,
            numberOfPeriods: 1,
            periodType: "semester",
          },
        },
      ],
    });

    await new OrderValidator().validate(placedHandoutOrder, false);

    const orderMovedToHandler = new OrderItemMovedFromOrderHandler();
    await orderMovedToHandler.updateOrderItems(placedHandoutOrder);

    return placedHandoutOrder;
  }

  private async verifyBlidNotActive(
    blid: string,
    customerId: string,
  ): Promise<string | null> {
    try {
      const activeCustomerItems =
        await new CustomerItemActiveBlid().getActiveCustomerItems(blid);
      if (activeCustomerItems.length > 0) {
        const lastCustomerItem = activeCustomerItems[0];
        if (lastCustomerItem?.customer === customerId)
          return "Denne boken er allerede delt ut til denne kunden.";
        return "Denne boken er allerede delt ut til en annen kunde. Sjekk bl-admin for mer informasjon.";
      }
    } catch {
      // Blid not active so it is free to be handed out
    }
    return null;
  }

  private async verifyUniqueItemPresent(
    blid: string,
  ): Promise<string | UniqueItem> {
    const uniqueItemQuery = new SEDbQuery();
    uniqueItemQuery.stringFilters = [{ fieldName: "blid", value: blid }];
    try {
      const uniqueItems =
        await BlStorage.UniqueItems.getByQuery(uniqueItemQuery);
      if (uniqueItems.length === 0) return blidNotActiveFeedback;
      return uniqueItems[0] ?? "";
    } catch {
      return blidNotActiveFeedback;
    }
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
}
