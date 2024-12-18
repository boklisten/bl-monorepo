import {
  PermissionService,
  SystemUser,
} from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { OrderToCustomerItemGenerator } from "@backend/collections/customer-item/helpers/order-to-customer-item-generator";
import { matchSchema } from "@backend/collections/match/match.schema";
import { OrderPlacedHandler } from "@backend/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderValidator } from "@backend/collections/order/helpers/order-validator/order-validator";
import { orderSchema } from "@backend/collections/order/order.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { isNotNullish } from "@backend/helper/typescript-helpers";
import { Operation } from "@backend/operation/operation";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { CustomerItem } from "@shared/customer-item/customer-item";
import {
  Match,
  MatchVariant,
  StandMatch,
  UserMatch,
} from "@shared/match/match";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { OrderItemType } from "@shared/order/order-item/order-item-type";
import { UserPermission } from "@shared/permission/user-permission";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { NextFunction, Request, Response } from "express";

export class OrderPlaceOperation implements Operation {
  private _queryBuilder: SEDbQueryBuilder;
  private _permissionService: PermissionService;
  private readonly _resHandler: SEResponseHandler;
  private readonly _orderToCustomerItemGenerator: OrderToCustomerItemGenerator;
  private readonly _orderStorage: BlDocumentStorage<Order>;
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;
  private readonly _orderPlacedHandler: OrderPlacedHandler;
  private readonly _orderValidator: OrderValidator;
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _matchStorage: BlDocumentStorage<Match>;

  constructor(
    resHandler?: SEResponseHandler,
    orderToCustomerItemGenerator?: OrderToCustomerItemGenerator,
    orderStorage?: BlDocumentStorage<Order>,
    customerItemStorage?: BlDocumentStorage<CustomerItem>,
    orderPlacedHandler?: OrderPlacedHandler,
    orderValidator?: OrderValidator,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    matchStorage?: BlDocumentStorage<Match>,
  ) {
    this._resHandler = resHandler ?? new SEResponseHandler();

    this._orderToCustomerItemGenerator =
      orderToCustomerItemGenerator ?? new OrderToCustomerItemGenerator();

    this._orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);

    this._customerItemStorage =
      customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);

    this._orderPlacedHandler = orderPlacedHandler ?? new OrderPlacedHandler();

    this._orderValidator = orderValidator ?? new OrderValidator();

    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);

    this._matchStorage =
      matchStorage ??
      new BlDocumentStorage(BlCollectionName.Matches, matchSchema);

    this._queryBuilder = new SEDbQueryBuilder();
    this._permissionService = new PermissionService();
  }

  private filterOrdersByAlreadyOrdered(orders: Order[]) {
    const customerOrderItems = [];

    for (const order of orders) {
      if (order.orderItems) {
        for (const orderItem of order.orderItems) {
          if (order.handoutByDelivery || !order.byCustomer) {
            continue;
          }

          if (orderItem.handout) {
            continue;
          }

          if (orderItem.movedToOrder) {
            continue;
          }

          if (
            orderItem.type === "rent" ||
            orderItem.type === "buy" ||
            orderItem.type === "partly-payment"
          ) {
            customerOrderItems.push(orderItem);
          }
        }
      }
    }
    return customerOrderItems;
  }

  private async hasOpenOrderWithOrderItems(order: Order) {
    const databaseQuery = this._queryBuilder.getDbQuery(
      { customer: order.customer, placed: "true" },
      [
        { fieldName: "customer", type: "object-id" },
        { fieldName: "placed", type: "boolean" },
      ],
    );

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const existingOrders = await this._orderStorage.getByQuery(databaseQuery);
      const alreadyOrderedItems =
        this.filterOrdersByAlreadyOrdered(existingOrders);

      for (const orderItem of order.orderItems) {
        for (const alreadyOrderedItem of alreadyOrderedItems) {
          if (
            orderItem.item === alreadyOrderedItem.item && // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            orderItem.info.to === alreadyOrderedItem.info.to
          ) {
            return true;
          }
        }
      }
    } catch {
      console.log("could not get user orders");
    }

    return false;
  }

  /**
   * Check whether a blid in the order is already handed out
   *
   * Unable to check against legacy customeritems which have no blid, but there
   * are very few of those which are not returned. Only checks whether a blid is
   * already handed out if the handout order type of the item in this order is
   * "buy", "rent" or "partly-payment".
   *
   * @param order The Order which contains items
   * @private
   */
  private async isSomeBlidAlreadyHandedOut(order: Order): Promise<boolean> {
    const handoutOrderTypes = new Set<OrderItemType>([
      "buy",
      "rent",
      "partly-payment",
    ]);
    const handoutItems = order.orderItems.filter(
      (orderItem) =>
        handoutOrderTypes.has(orderItem.type) && orderItem.blid != null,
    );
    if (handoutItems.length === 0) {
      return false;
    }

    try {
      // Use an aggregation because the query builder does not support checking against a list of blids,
      // and we would otherwise have to send a query for every single order item.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const unreturnedItems = await this._customerItemStorage.aggregate([
        {
          $match: {
            blid: {
              $in: handoutItems.map((handoutItem) => handoutItem.blid),
            },
            returned: false,
            // In some cases, books that have previously been bought out get returned
            // to Boklistens possesion without being registered as a buyback
            // Therefore, it should be possible to hand out books that have been bought out
            buyout: false,
          },
        },
      ]);
      return unreturnedItems.length > 0;
    } catch {
      console.error(
        "Could not check whether some items are already handed out",
      );
      return false;
    }
  }

  /**
   * For each customerItem, check that the customer who owns it does not have a locked UserMatch with the same item
   * @param customerItems the customer items to be verified
   * @param userMatches the user matches to check against
   * @throws if someone tries to return/buyback a customerItem that's locked to a UserMatch
   * @private
   */
  private verifyCustomerItemsNotInLockedUserMatch(
    customerItems: CustomerItem[],
    userMatches: UserMatch[],
  ) {
    for (const customerItem of customerItems) {
      const customerId = customerItem.customer;
      if (
        userMatches.some(
          (userMatch) =>
            userMatch.itemsLockedToMatch &&
            (userMatch.sender === customerId ||
              userMatch.receiver === customerId) &&
            userMatch.expectedItems.includes(customerItem.item),
        )
      ) {
        throw new BlError(
          "Ordren inneholder bøker som er låst til en UserMatch; kunden må overlevere de låste bøkene til en annen elev",
        ).code(802);
      }
    }
  }

  /**
   * For each item, check that the customer does not have a locked UserMatch with the same item
   * @param itemIds the IDs of the items to be verified
   * @param userMatches the user matches to check against
   * @param customerId the ID of the customer
   * @throws if someone tries to receive an item that's locked to a UserMatch
   * @private
   */
  private verifyItemsNotInLockedUserMatch(
    itemIds: string[],
    userMatches: UserMatch[],
    customerId: string,
  ) {
    for (const itemId of itemIds) {
      if (
        userMatches.some(
          (userMatch) =>
            userMatch.itemsLockedToMatch &&
            (userMatch.sender === customerId ||
              userMatch.receiver === customerId) &&
            userMatch.expectedItems.includes(itemId),
        )
      ) {
        throw new BlError(
          "Ordren inneholder bøker som er låst til en UserMatch; kunden må motta de låste bøkene fra en annen elev",
        ).code(807);
      }
    }
  }

  /**
   * Go through the orderItems and update matches if any of the customerItems belong to a match
   * @param allMatches all the matches
   * @param returnOrderItems the orderItems for items that are handed in
   * @param handoutOrderItems the orderItems for items that are handed out
   * @private
   */
  private async updateMatchesIfPresent(
    allMatches: Match[],
    returnOrderItems: OrderItem[],
    handoutOrderItems: OrderItem[],
  ) {
    if (returnOrderItems.length === 0 && handoutOrderItems.length === 0) {
      return;
    }

    const returnCustomerItems = await this._customerItemStorage.getMany(
      returnOrderItems
        .map((orderItem) => orderItem.customerItem)
        .filter(isNotNullish),
    );

    const handoutCustomerItems = await this._customerItemStorage.getMany(
      handoutOrderItems
        .map((orderItem) => orderItem.customerItem)
        .filter(isNotNullish),
    );

    const standMatches = allMatches.filter(
      (match) => match._variant === MatchVariant.StandMatch,
    );

    const userMatches = allMatches.filter(
      (match) => match._variant === MatchVariant.UserMatch,
    );

    await this.updateStandMatchHandoffs(returnCustomerItems, standMatches);
    await this.updateStandMatchPickups(handoutCustomerItems, standMatches);
    await this.updateSenderUserMatches(returnCustomerItems, userMatches);
    await this.updateReceiverUserMatches(handoutCustomerItems, userMatches);
  }

  // Update the deliveredItems of the customer's StandMatches to show those newly handed in
  private async updateStandMatchHandoffs(
    returnCustomerItems: CustomerItem[],
    standMatches: StandMatch[],
  ) {
    const matchToDeliveredItemsMap = this.groupValuesByMatch(
      returnCustomerItems,
      (customerItem) =>
        standMatches.find(
          (standMatch) =>
            standMatch.customer === customerItem.customer &&
            standMatch.expectedHandoffItems.includes(customerItem.item) &&
            !standMatch.deliveredItems.includes(customerItem.item),
        ),
      (customerItem, match) => [...match.deliveredItems, customerItem.item],
    );

    for (const [
      standMatchId,
      deliveredItems,
    ] of matchToDeliveredItemsMap.entries()) {
      await this._matchStorage.update(
        standMatchId,
        {
          deliveredItems: [...deliveredItems],
        },
        new SystemUser(),
      );
    }
  }

  // Update the receivedItems of the customer's StandMatches to show those newly picked up
  private async updateStandMatchPickups(
    handoutCustomerItems: CustomerItem[],
    standMatches: StandMatch[],
  ) {
    const matchToReceivedItemsMap = this.groupValuesByMatch(
      handoutCustomerItems,
      (customerItem) =>
        standMatches.find(
          (standMatch) =>
            standMatch.customer === customerItem.customer &&
            standMatch.expectedPickupItems.includes(customerItem.item) &&
            !standMatch.receivedItems.includes(customerItem.item),
        ),
      (customerItem, match) => [...match.receivedItems, customerItem.item],
    );

    for (const [
      standMatchId,
      receivedItems,
    ] of matchToReceivedItemsMap.entries()) {
      await this._matchStorage.update(
        standMatchId,
        {
          receivedItems: [...receivedItems],
        },
        new SystemUser(),
      );
    }
  }

  // Update the receivedBlids of all UserMatches where the stand customer is receiver to show those newly picked up
  private async updateReceiverUserMatches(
    handoutCustomerItems: CustomerItem[],
    userMatches: UserMatch[],
  ) {
    const matchToReceivedBlIdsMap = this.groupValuesByMatch(
      handoutCustomerItems,
      (handoutCustomerItem) =>
        userMatches.find(
          (match) =>
            match.receiver === handoutCustomerItem.customer &&
            match.expectedItems.includes(handoutCustomerItem.item) &&
            handoutCustomerItem.blid &&
            !match.receivedBlIds.includes(handoutCustomerItem.blid),
        ),
      (handoutCustomerItem, userMatch) => [
        ...userMatch.receivedBlIds,
        handoutCustomerItem?.blid ?? "",
      ],
    );

    for (const [matchId, receivedBlIds] of matchToReceivedBlIdsMap.entries()) {
      await this._matchStorage.update(
        matchId,
        { receivedBlIds: [...receivedBlIds] },
        new SystemUser(),
      );
    }
  }

  // Update the deliveredBlIds of all UserMatches where the book owner is sender to show those newly handed in
  private async updateSenderUserMatches(
    returnCustomerItems: CustomerItem[],
    userMatches: UserMatch[],
  ) {
    const matchToDeliveredBlIdsMap = this.groupValuesByMatch(
      returnCustomerItems,
      (returnCustomerItem) =>
        userMatches.find(
          (match) =>
            match.sender === returnCustomerItem.customer &&
            match.expectedItems.includes(returnCustomerItem.item) &&
            returnCustomerItem.blid &&
            !match.deliveredBlIds.includes(returnCustomerItem.blid),
        ),
      (returnCustomerItem, userMatch) => [
        ...userMatch.deliveredBlIds,
        returnCustomerItem?.blid ?? "",
      ],
    );

    for (const [
      matchId,
      deliveredBlIds,
    ] of matchToDeliveredBlIdsMap.entries()) {
      await this._matchStorage.update(
        matchId,
        { deliveredBlIds: [...deliveredBlIds] },
        new SystemUser(),
      );
    }
  }

  // Using some collection of values, group those values by match.
  // Can be used to e.g. combine all required updates to a match.
  private groupValuesByMatch<V, M extends Match>(
    values: V[],
    findMatch: (value: V) => M | undefined,
    valuesExtractor: (value: V, match: M) => string[],
  ): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    for (const value of values) {
      const match = findMatch(value);
      if (match) {
        map.set(
          match.id,
          new Set([
            ...(map.get(match.id) ?? []),
            ...valuesExtractor(value, match),
          ]),
        );
      }
    }

    return map;
  }

  public async run(
    blApiRequest: BlApiRequest,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request?: Request,
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next?: NextFunction,
  ): Promise<boolean> {
    let order: Order;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      order = await this._orderStorage.get(blApiRequest.documentId);
    } catch {
      throw new ReferenceError(`order "${blApiRequest.documentId}" not found`);
    }

    const pendingSignature =
      await this._orderPlacedHandler.isSignaturePending(order);

    if (order.byCustomer) {
      const orderContainsActiveCustomerItems =
        await this.hasOpenOrderWithOrderItems(order);
      if (orderContainsActiveCustomerItems) {
        throw new BlError("Order contains active customer items").code(500);
      }
    }

    const someBlidAlreadyHandedOut =
      await this.isSomeBlidAlreadyHandedOut(order);

    if (someBlidAlreadyHandedOut) {
      throw new BlError(
        "En eller flere av bøkene du prøver å dele ut er allerede aktiv på en annen kunde. Prøv å dele ut én og én bok for å finne ut hvilke bøker dette gjelder.",
      ).code(801);
    }

    const returnOrderItems = order.orderItems.filter(
      (orderItem) =>
        orderItem.type === "return" || orderItem.type === "buyback",
    );
    const handoutOrderItems = order.orderItems.filter(
      (orderItem) => orderItem.handout && orderItem.type === "rent",
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const allMatches = await this._matchStorage.getAll();

    if (!order.byCustomer) {
      await this.verifyCompatibilityWithMatches(
        returnOrderItems,
        handoutOrderItems,
        allMatches,
        order.customer,
      );
    }

    let customerItems =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this._orderToCustomerItemGenerator.generate(order);

    if (customerItems && customerItems.length > 0) {
      customerItems = await this.addCustomerItems(
        customerItems,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        blApiRequest.user,
      );
      order = this.addCustomerItemIdToOrderItems(order, customerItems);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this._orderStorage.update(
        order.id,
        {
          orderItems: order.orderItems,
          pendingSignature,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        blApiRequest.user,
      );
    }

    if (!order.byCustomer) {
      await this.updateMatchesIfPresent(
        allMatches,
        returnOrderItems,
        handoutOrderItems,
      );
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._orderPlacedHandler.placeOrder(order, {
      sub: blApiRequest.user,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      permission: blApiRequest.user.permission,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any);

    const isAdmin =
      blApiRequest.user?.permission !== undefined &&
      this._permissionService.isPermissionEqualOrOver(
        blApiRequest.user?.permission,
        "admin",
      );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._orderValidator.validate(order, isAdmin);

    if (customerItems && customerItems.length > 0) {
      try {
        // should add customerItems to customer if present
        await this.addCustomerItemsToCustomer(
          customerItems,
          order.customer,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          blApiRequest.user,
        );
        // eslint-disable-next-line no-empty
      } catch {}
    } // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._resHandler.sendResponse(res, new BlapiResponse([order]));
    return true;
  }

  /**
   * Verify that the order does not try to hand out or in an item locked to one of the customer's UserMatches
   * @param returnOrderItems the orderItems that will be handed in
   * @param handoutOrderItems the orderItems that will be handed out
   * @param allMatches all the matches
   * @param customerId the customer the order belongs to
   * @throws if the order tries to hand out or in a (customer)Item locked to a UserMatch
   * @private
   */
  private async verifyCompatibilityWithMatches(
    returnOrderItems: OrderItem[],
    handoutOrderItems: OrderItem[],
    allMatches: Match[],
    customerId: string,
  ) {
    const userMatches: UserMatch[] = allMatches.filter(
      (match) => match._variant === MatchVariant.UserMatch,
    );
    const returnCustomerItems = await this._customerItemStorage.getMany(
      returnOrderItems
        .map((orderItem) => orderItem.customerItem)
        .filter(isNotNullish),
    );
    const handoutItems = handoutOrderItems.map((orderItem) => orderItem.item);
    this.verifyCustomerItemsNotInLockedUserMatch(
      returnCustomerItems,
      userMatches,
    );
    this.verifyItemsNotInLockedUserMatch(handoutItems, userMatches, customerId);
  }

  private async addCustomerItems(
    customerItems: CustomerItem[],
    user: { id: string; permission: UserPermission },
  ): Promise<CustomerItem[]> {
    const addedCustomerItems = [];
    for (const customerItem of customerItems) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ci = await this._customerItemStorage.add(customerItem, user);
      addedCustomerItems.push(ci);
    }

    return addedCustomerItems;
  }

  private async addCustomerItemsToCustomer(
    customerItems: CustomerItem[],
    customerId: string,
    user: { id: string; permission: UserPermission },
  ): Promise<boolean> {
    const customerItemIds: string[] = customerItems.map((ci) => {
      return ci.id.toString();
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userDetail = await this._userDetailStorage.get(customerId);

    let userDetailCustomerItemsIds = userDetail.customerItems ?? [];

    userDetailCustomerItemsIds =
      userDetailCustomerItemsIds.concat(customerItemIds);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._userDetailStorage.update(
      customerId,
      { customerItems: userDetailCustomerItemsIds },
      user,
    );

    return true;
  }

  private addCustomerItemIdToOrderItems(
    order: Order,
    customerItems: CustomerItem[],
  ) {
    for (const customerItem of customerItems) {
      for (const orderItem of order.orderItems) {
        if (customerItem.item === orderItem.item) {
          orderItem.customerItem = customerItem.id;
        }
      }
    }
    return order;
  }
}
