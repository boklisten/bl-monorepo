import { CustomerItemHandler } from "#services/collections/customer-item/helpers/customer-item-handler";
import { EmailService } from "#services/messenger/email/email-service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Message } from "#shared/message/message";

export class MessengerReminder {
  private readonly customerItemHandler: CustomerItemHandler;
  private readonly emailService: EmailService;

  constructor(
    customerItemHandler?: CustomerItemHandler,
    emailService?: EmailService,
  ) {
    this.customerItemHandler = customerItemHandler ?? new CustomerItemHandler();
    this.emailService = emailService ?? new EmailService();
  }

  /**
   *  Reminds a customer to return a item with the specified deadline
   */
  public async remindCustomer(message: Message): Promise<void> {
    if (message.customerId == null || message.customerId.length <= 0) {
      throw new BlError("customerId is null or undefined").code(701);
    }

    // @ts-expect-error fixme: auto ignored
    if (!message.info || message.info["deadline"] == null) {
      throw new BlError("deadline is null or undefined").code(701);
    }

    const notReturnedCustomerItems =
      await this.customerItemHandler.getNotReturned(
        message.customerId,

        // @ts-expect-error fixme: auto ignored
        message.info["deadline"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.messageSubtype as any,
      );

    const userDetail = await BlStorage.UserDetails.get(message.customerId);

    await this.emailService.remind(
      message,
      userDetail,
      notReturnedCustomerItems,
    );
  }
}
