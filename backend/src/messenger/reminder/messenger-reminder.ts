import { BlError, Message, UserDetail } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { CustomerItemHandler } from "@/collections/customer-item/helpers/customer-item-handler";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { EmailService } from "@/messenger/email/email-service";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class MessengerReminder {
  private readonly customerItemHandler: CustomerItemHandler;
  private readonly userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly emailService: EmailService;

  constructor(
    customerItemHandler?: CustomerItemHandler,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    emailService?: EmailService,
  ) {
    this.customerItemHandler = customerItemHandler ?? new CustomerItemHandler();
    this.userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage<UserDetail>(
        BlCollectionName.UserDetails,
        userDetailSchema,
      );
    this.emailService = emailService ?? new EmailService();
  }

  /**
   *  Tries to remind all customers to return items that have the specified deadline
   *  @param deadline the deadline the reminder is for
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public remindAll(deadline: Date) {
    throw new BlError("Not implemented!").code(200);
  }

  /**
   *  Reminds a customer to return a item with the specified deadline
   */
  public async remindCustomer(message: Message): Promise<void> {
    if (message.customerId == null || message.customerId.length <= 0) {
      throw new BlError("customerId is null or undefined").code(701);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!message.info || message.info["deadline"] == null) {
      throw new BlError("deadline is null or undefined").code(701);
    }

    const notReturnedCustomerItems =
      await this.customerItemHandler.getNotReturned(
        message.customerId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        message.info["deadline"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.messageSubtype as any,
      );

    const userDetail = await this.userDetailStorage.get(message.customerId);

    await this.emailService.remind(
      message,
      userDetail,
      notReturnedCustomerItems,
    );
  }
}
