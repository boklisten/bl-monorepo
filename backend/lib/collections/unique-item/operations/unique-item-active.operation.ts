import { CustomerItemActiveBlid } from "@backend/lib/collections/customer-item/helpers/customer-item-active-blid.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { UniqueItem } from "@shared/unique-item/unique-item.js";

export class UniqueItemActiveOperation implements Operation {
  private customerItemActiveBlid: CustomerItemActiveBlid;

  constructor(customerItemActiveBlid?: CustomerItemActiveBlid) {
    this.customerItemActiveBlid =
      customerItemActiveBlid ?? new CustomerItemActiveBlid();
  }

  async run(blApiRequest: BlApiRequest) {
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
      return new BlapiResponse([]);
    }

    return new BlapiResponse(activeCustomerItemIds);
  }
}
