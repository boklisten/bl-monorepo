import { CustomerItemHandler } from "@backend/collections/customer-item/helpers/customer-item-handler";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { EmailService } from "@backend/messenger/email/email-service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Message } from "@shared/message/message";
import { UserDetail } from "@shared/user/user-detail/user-detail";

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
      userDetailStorage ?? new BlDocumentStorage(UserDetailModel);
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

    const userDetail = await this.userDetailStorage.get(message.customerId);

    await this.emailService.remind(
      message,
      userDetail,
      notReturnedCustomerItems,
    );
  }
}
