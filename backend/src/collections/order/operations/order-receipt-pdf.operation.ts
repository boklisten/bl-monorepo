import { OrderModel } from "@backend/collections/order/order.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Messenger } from "@backend/messenger/messenger";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class OrderReceiptPdfOperation implements Operation {
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
      : new BlDocumentStorage(UserDetailModel);
    this._orderStorage = orderStorage
      ? orderStorage
      : new BlDocumentStorage(OrderModel);
    this._resHandler = resHandler ? resHandler : new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    const order = await this._orderStorage.get(blApiRequest.documentId);
    const customerDetail = await this._userDetailStorage.get(order.customer);

    const orderReceiptPdf = await this._messenger.getOrderReceiptPdf(
      customerDetail,
      order,
    );

    // @ts-expect-error fixme: auto ignored
    this._resHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
