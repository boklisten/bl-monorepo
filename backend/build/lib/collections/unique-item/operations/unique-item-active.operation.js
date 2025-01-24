import { CustomerItemActiveBlid } from "@backend/lib/collections/customer-item/helpers/customer-item-active-blid.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
export class UniqueItemActiveOperation {
    customerItemActiveBlid;
    constructor(customerItemActiveBlid) {
        this.customerItemActiveBlid =
            customerItemActiveBlid ?? new CustomerItemActiveBlid();
    }
    async run(blApiRequest) {
        let uniqueItem;
        try {
            uniqueItem = await BlStorage.UniqueItems.get(blApiRequest.documentId);
        }
        catch {
            throw new BlError("not found").code(702);
        }
        let activeCustomerItemIds;
        try {
            activeCustomerItemIds =
                await this.customerItemActiveBlid.getActiveCustomerItemIds(uniqueItem.blid);
        }
        catch {
            return new BlapiResponse([]);
        }
        return new BlapiResponse(activeCustomerItemIds);
    }
}
