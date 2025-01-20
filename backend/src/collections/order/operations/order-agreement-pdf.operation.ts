import { Messenger } from "@backend/messenger/messenger.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";

export class OrderAgreementPdfOperation implements Operation {
  private messenger = new Messenger();

  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    const order = await BlStorage.Orders.get(blApiRequest.documentId);
    const customerDetail = await BlStorage.UserDetails.get(order.customer);

    const orderReceiptPdf = await this.messenger.getOrderAgreementPdf(
      customerDetail,
      order,
    );

    BlResponseHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
