import { OrderModel } from "@backend/collections/order/order.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Messenger } from "@backend/messenger/messenger";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Request, Response } from "express";

export class OrderReceiptPdfOperation implements Operation {
  private messenger = new Messenger();
  private userDetailStorage = new BlStorage(UserDetailModel);
  private orderStorage = new BlStorage(OrderModel);
  private resHandler = new SEResponseHandler();

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    const order = await this.orderStorage.get(blApiRequest.documentId);
    const customerDetail = await this.userDetailStorage.get(order.customer);

    const orderReceiptPdf = await this.messenger.getOrderReceiptPdf(
      customerDetail,
      order,
    );

    // @ts-expect-error fixme: auto ignored
    this.resHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
