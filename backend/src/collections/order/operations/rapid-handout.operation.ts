import { SystemUser } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator";
import { itemSchema } from "@backend/collections/item/item.schema";
import { OrderActive } from "@backend/collections/order/helpers/order-active/order-active";
import { OrderItemMovedFromOrderHandler } from "@backend/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { orderSchema } from "@backend/collections/order/order.schema";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";
import { Operation } from "@backend/operation/operation";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Branch } from "@shared/branch/branch";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Item } from "@shared/item/item";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { ObjectId } from "mongodb";

const blidNotActiveFeedback =
  "Denne bliden er ikke tilknyttet noen bok. Registrer den i bl-admin for å dele den ut.";

export class RapidHandoutOperation implements Operation {
  private readonly wrongSenderFeedback = `Boken du skannet tilhørte en annen elev enn den som ga deg den. Du skal beholde den, men eleven som ga deg boken er fortsatt ansvarlig for at den opprinnelige boken blir levert.`;

  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _uniqueItemStorage: BlDocumentStorage<UniqueItem>;
  private readonly _branchStorage: BlDocumentStorage<Branch>;
  private readonly _itemStorage: BlDocumentStorage<Item>;

  constructor(
    orderStorage?: BlDocumentStorage<Order>,
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    branchStorage?: BlDocumentStorage<Branch>,
    itemStorage?: BlDocumentStorage<Item>,
  ) {
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
    const rapidHandoutSpec = blApiRequest.data;
    if (!verifyRapidHandoutSpec(rapidHandoutSpec)) {
      throw new BlError(`Malformed RapidHandoutSpec`).code(701);
    }
    const { blid, customerId } = rapidHandoutSpec;

    if (!this.isValidBlid(blid)) {
      throw new BlError("blid is not a valid blid").code(803);
    }
    const userFeedback = await this.verifyBlidNotActive(blid, customerId);
    if (userFeedback) return new BlapiResponse([{ feedback: userFeedback }]);

    const uniqueItemOrFeedback = await this.verifyUniqueItemPresent(
      rapidHandoutSpec.blid,
    );
    if (typeof uniqueItemOrFeedback === "string")
      return new BlapiResponse([{ feedback: uniqueItemOrFeedback }]);

    const placedRentOrder = await this.placeRentOrder(
      blid,
      uniqueItemOrFeedback.item,
      customerId,
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

  private async placeRentOrder(
    blid: string,
    itemId: string,
    customerId: string,
  ): Promise<Order> {
    const item = await this._itemStorage.get(itemId);
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
    const branch = await this._branchStorage.get(customerOrder.order.branch);

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

    const handoutOrder: Order = {
      // @ts-expect-error id will be auto-generated
      id: undefined,
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
    };
    const placedHandoutOrder = await this._orderStorage.add(
      handoutOrder,
      new SystemUser(),
    );

    await new OrderValidator().validate(placedHandoutOrder, false);

    const orderMovedToHandler = new OrderItemMovedFromOrderHandler(
      this._orderStorage,
    );
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
        await this._uniqueItemStorage.getByQuery(uniqueItemQuery);
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

function verifyRapidHandoutSpec(
  m: unknown,
): m is { blid: string; customerId: string } {
  return (
    !!m &&
    typeof m === "object" &&
    "blid" in m &&
    typeof m["blid"] == "string" &&
    m["blid"].length > 0 &&
    "customerId" in m &&
    typeof m["customerId"] == "string" &&
    ObjectId.isValid(m["customerId"])
  );
}
