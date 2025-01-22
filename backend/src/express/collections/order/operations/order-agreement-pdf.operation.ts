import Messenger from "@backend/express/messenger/messenger.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";

export class OrderAgreementPdfOperation implements Operation {
  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    const order = await BlStorage.Orders.get(blApiRequest.documentId);
    const customerDetail = await BlStorage.UserDetails.get(order.customer);

    const orderReceiptPdf = await Messenger.getOrderAgreementPdf(
      customerDetail,
      order,
    );

    BlResponseHandler.sendResponse(res, new BlapiResponse([orderReceiptPdf]));

    return true;
  }
}
