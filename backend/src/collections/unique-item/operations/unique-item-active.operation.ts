import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UniqueItem } from "@shared/unique-item/unique-item.js";
import { Request, Response } from "express";

export class UniqueItemActiveOperation implements Operation {
  private customerItemActiveBlid: CustomerItemActiveBlid;

  constructor(customerItemActiveBlid?: CustomerItemActiveBlid) {
    this.customerItemActiveBlid =
      customerItemActiveBlid ?? new CustomerItemActiveBlid();
  }

  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    let uniqueItem: UniqueItem;
    try {
      uniqueItem = await BlStorage.UniqueItems.get(blApiRequest.documentId);
    } catch {
      throw new BlError("not found").code(702);
    }

    let activeCustomerItemIds;
    try {
      activeCustomerItemIds =
        await this.customerItemActiveBlid.getActiveCustomerItemIds(
          uniqueItem.blid,
        );
    } catch {
      this.sendResponse(res, []);
      return true;
    }

    this.sendResponse(res, activeCustomerItemIds);
    return true;
  }

  private sendResponse(res: Response, ids: string[]) {
    BlResponseHandler.sendResponse(res, new BlapiResponse(ids));
  }
}
