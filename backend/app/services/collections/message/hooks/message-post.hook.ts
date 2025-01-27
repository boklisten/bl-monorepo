import { PermissionService } from "#services/auth/permission.service";
import { Hook } from "#services/hook/hook";
import Messenger from "#services/messenger/messenger";
import { MessengerReminder } from "#services/messenger/reminder/messenger-reminder";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Message } from "#shared/message/message";
import { AccessToken } from "#shared/token/access-token";

export class MessagePostHook extends Hook {
  private readonly messengerReminder: MessengerReminder;

  constructor(messengerReminder?: MessengerReminder) {
    super();
    this.messengerReminder = messengerReminder ?? new MessengerReminder();
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
      !PermissionService.isPermissionEqualOrOver(
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
    const userDetail = await BlStorage.UserDetails.get(
      message.customerId,
    ).catch(() => {
      throw new BlError(`Could not find customerId ${message.customerId}`).code(
        702,
      );
    });
    // Do not await to improve performance
    Messenger.send(message, userDetail).catch((error) => {
      throw new BlError(`Could not send generic message`).code(200).add(error);
    });
    return message;
  }

  private async onMatch(message: Message): Promise<Message> {
    const userDetail = await BlStorage.UserDetails.get(
      message.customerId,
    ).catch(() => {
      throw new BlError(`Could not find customerId ${message.customerId}`).code(
        702,
      );
    });

    // Do not await to improve performance
    Messenger.send(message, userDetail).catch((error) => {
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
