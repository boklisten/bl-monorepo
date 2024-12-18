import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Hook } from "@backend/hook/hook";
import { Messenger } from "@backend/messenger/messenger";
import { MessengerReminder } from "@backend/messenger/reminder/messenger-reminder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Message } from "@shared/message/message";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class MessagePostHook extends Hook {
  private readonly messengerReminder: MessengerReminder;
  private readonly permissionService: PermissionService;
  private readonly messenger: Messenger;
  private readonly userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(
    messengerReminder?: MessengerReminder,
    messenger?: Messenger,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    super();
    this.messengerReminder = messengerReminder ?? new MessengerReminder();
    this.permissionService = new PermissionService();
    this.messenger = messenger ?? new Messenger();
    this.userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  override async before(
    message: Message,
    accessToken: AccessToken,
  ): Promise<Message> {
    if (message.messageType === undefined || !message.messageType) {
      throw new BlError("messageType is not defined").code(701);
    }

    if (message.messageSubtype === undefined || !message.messageSubtype) {
      throw new BlError("messageSubtype is not defined").code(701);
    }

    if (
      message.messageType === "reminder" &&
      !this.permissionService.isPermissionEqualOrOver(
        accessToken.permission,
        "admin",
      )
    ) {
      throw new BlError("no permission").code(904);
    }

    switch (message.messageType) {
      case "custom-reminder":
      case "reminder": {
        if (
          message.messageType === "custom-reminder" &&
          message.messageMethod !== "sms"
        ) {
          throw new BlError("Cannot send custom email reminder, only SMS").code(
            808,
          );
        }
        return await this.onRemind(message);
      }
      case "generic": {
        return await this.onGeneric(message);
      }
      case "match": {
        return await this.onMatch(message);
      }
      default: {
        throw new BlError(
          `MessageType "${message.messageType}" is not supported`,
        ).code(701);
      }
    }
  }

  private async onGeneric(message: Message): Promise<Message> {
    const userDetail = await this.userDetailStorage
      .get(message.customerId)
      .catch(() => {
        throw new BlError(
          `Could not find customerId ${message.customerId}`,
        ).code(702);
      });
    // Do not await to improve performance
    this.messenger.send(message, userDetail).catch((error) => {
      throw new BlError(`Could not send generic message`).code(200).add(error);
    });
    return message;
  }

  private async onMatch(message: Message): Promise<Message> {
    const userDetail = await this.userDetailStorage
      .get(message.customerId)
      .catch(() => {
        throw new BlError(
          `Could not find customerId ${message.customerId}`,
        ).code(702);
      });

    // Do not await to improve performance
    this.messenger.send(message, userDetail).catch((error) => {
      throw new BlError(`Could not send match message`).code(200).add(error);
    });
    return message;
  }

  private async onRemind(message: Message): Promise<Message> {
    // Do not await to improve performance
    this.messengerReminder.remindCustomer(message).catch((error) => {
      throw new BlError(`Could not send reminder message`).code(200).add(error);
    });
    return message;
  }
}
