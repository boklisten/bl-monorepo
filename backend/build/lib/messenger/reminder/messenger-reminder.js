import { CustomerItemHandler } from "@backend/lib/collections/customer-item/helpers/customer-item-handler.js";
import { EmailService } from "@backend/lib/messenger/email/email-service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class MessengerReminder {
    customerItemHandler;
    emailService;
    constructor(customerItemHandler, emailService) {
        this.customerItemHandler = customerItemHandler ?? new CustomerItemHandler();
        this.emailService = emailService ?? new EmailService();
    }
    /**
     *  Reminds a customer to return a item with the specified deadline
     */
    async remindCustomer(message) {
        if (message.customerId == null || message.customerId.length <= 0) {
            throw new BlError("customerId is null or undefined").code(701);
        }
        // @ts-expect-error fixme: auto ignored
        if (!message.info || message.info["deadline"] == null) {
            throw new BlError("deadline is null or undefined").code(701);
        }
        const notReturnedCustomerItems = await this.customerItemHandler.getNotReturned(message.customerId, 
        // @ts-expect-error fixme: auto ignored
        message.info["deadline"], 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.messageSubtype);
        const userDetail = await BlStorage.UserDetails.get(message.customerId);
        await this.emailService.remind(message, userDetail, notReturnedCustomerItems);
    }
}
