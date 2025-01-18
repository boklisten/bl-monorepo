import { Messenger } from "@backend/messenger/messenger";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Request, Response } from "express";

export class OrderAgreementPdfOperation implements Operation {
  private messenger = new Messenger();
  private resHandler = new SEResponseHandler();

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

    this.resHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
