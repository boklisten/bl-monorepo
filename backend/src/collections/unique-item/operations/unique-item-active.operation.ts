import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { UniqueItemModel } from "@backend/collections/unique-item/unique-item.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { Request, Response } from "express";

export class UniqueItemActiveOperation implements Operation {
  private customerItemActiveBlid: CustomerItemActiveBlid;
  private uniqueItemStorage: BlStorage<UniqueItem>;
  private resHandler: SEResponseHandler;

  constructor(
    customerItemActiveBlid?: CustomerItemActiveBlid,
    uniqueItemStorage?: BlStorage<UniqueItem>,
    resHandler?: SEResponseHandler,
  ) {
    this.customerItemActiveBlid =
      customerItemActiveBlid ?? new CustomerItemActiveBlid();
    this.uniqueItemStorage =
      uniqueItemStorage ?? new BlStorage(UniqueItemModel);
    this.resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    let uniqueItem: UniqueItem;
    try {
      uniqueItem = await this.uniqueItemStorage.get(blApiRequest.documentId);
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
    this.resHandler.sendResponse(res, new BlapiResponse(ids));
  }
}
