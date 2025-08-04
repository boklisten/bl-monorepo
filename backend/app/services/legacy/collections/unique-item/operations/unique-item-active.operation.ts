import { CustomerItemActiveBlid } from "#services/legacy/collections/customer-item/helpers/customer-item-active-blid";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";
import { UniqueItem } from "#shared/unique-item";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

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
