import { Messenger } from "@backend/messenger/messenger.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { SEResponseHandler } from "@backend/response/se.response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";

export class OrderReceiptPdfOperation implements Operation {
  private messenger = new Messenger();
  private resHandler = new SEResponseHandler();

  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    const order = await BlStorage.Orders.get(blApiRequest.documentId);
    const customerDetail = await BlStorage.UserDetails.get(order.customer);

    const orderReceiptPdf = await this.messenger.getOrderReceiptPdf(
      customerDetail,
      order,
    );

    this.resHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
