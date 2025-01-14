import { BlCollectionName } from "@backend/collections/bl-collection";
import { CustomerItemActiveBlid } from "@backend/collections/customer-item/helpers/customer-item-active-blid";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { NextFunction, Request, Response } from "express";

export class UniqueItemActiveOperation implements Operation {
  constructor(
    private customerItemActiveBlid?: CustomerItemActiveBlid,
    private uniqueItemStorage?: BlDocumentStorage<UniqueItem>,
    private resHandler?: SEResponseHandler,
  ) {
    this.customerItemActiveBlid = customerItemActiveBlid
      ? customerItemActiveBlid
      : new CustomerItemActiveBlid();
    this.uniqueItemStorage = uniqueItemStorage
      ? uniqueItemStorage
      : new BlDocumentStorage(BlCollectionName.UniqueItems, uniqueItemSchema);
    this.resHandler = resHandler ? resHandler : new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next?: NextFunction,
  ): Promise<boolean> {
    let uniqueItem: UniqueItem;
    try {
      // @ts-expect-error fixme: auto ignored
      uniqueItem = await this.uniqueItemStorage.get(blApiRequest.documentId);
    } catch {
      throw new BlError("not found").code(702);
    }

    let activeCustomerItemIds;
    try {
      activeCustomerItemIds =
        // @ts-expect-error fixme: auto ignored
        await this.customerItemActiveBlid.getActiveCustomerItemIds(
          uniqueItem.blid,
        );
    } catch {
      // @ts-expect-error fixme: auto ignored
      this.sendResponse(res, []);
      return true;
    }

    // @ts-expect-error fixme: auto ignored
    this.sendResponse(res, activeCustomerItemIds);
    return true;
  }

  private sendResponse(res: Response, ids: string[]) {
    // @ts-expect-error fixme: auto ignored
    this.resHandler.sendResponse(res, new BlapiResponse(ids));
  }
}
