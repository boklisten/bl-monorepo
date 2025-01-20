import { PermissionService } from "@backend/auth/permission/permission.service.js";
import { Hook } from "@backend/hook/hook.js";
import { Messenger } from "@backend/messenger/messenger.js";
import { MessengerReminder } from "@backend/messenger/reminder/messenger-reminder.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Message } from "@shared/message/message.js";
import { AccessToken } from "@shared/token/access-token.js";

export class MessagePostHook extends Hook {
  private readonly messengerReminder: MessengerReminder;
  private readonly messenger: Messenger;

  constructor(messengerReminder?: MessengerReminder, messenger?: Messenger) {
    super();
    this.messengerReminder = messengerReminder ?? new MessengerReminder();
    this.messenger = messenger ?? new Messenger();
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
    this.messenger.send(message, userDetail).catch((error) => {
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
