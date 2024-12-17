import { BlCollectionName } from "@backend/collections/bl-collection";
import { orderSchema } from "@backend/collections/order/order.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Messenger } from "@backend/messenger/messenger";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { NextFunction, Request, Response } from "express";

export class OrderAgreementPdfOperation implements Operation {
  private _messenger: Messenger;
  private _userDetailStorage: BlDocumentStorage<UserDetail>;
  private _orderStorage: BlDocumentStorage<Order>;
  private _resHandler?: SEResponseHandler;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    resHandler?: SEResponseHandler,
    orderStorage?: BlDocumentStorage<Order>,
  ) {
    this._messenger = new Messenger();
    this._userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._orderStorage = orderStorage
      ? orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this._resHandler = resHandler ? resHandler : new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req?: Request,
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next?: NextFunction,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const order = await this._orderStorage.get(blApiRequest.documentId);
    const customerDetail = await this._userDetailStorage.get(order.customer);

    const orderReceiptPdf = await this._messenger.getOrderAgreementPdf(
      customerDetail,
      order,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._resHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
