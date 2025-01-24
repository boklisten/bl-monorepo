import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { Hook } from "@backend/lib/hook/hook.js";
import Messenger from "@backend/lib/messenger/messenger.js";
import { MessengerReminder } from "@backend/lib/messenger/reminder/messenger-reminder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class MessagePostHook extends Hook {
    messengerReminder;
    constructor(messengerReminder) {
        super();
        this.messengerReminder = messengerReminder ?? new MessengerReminder();
    }
    async before(message, accessToken) {
        if (message.messageType === undefined || !message.messageType) {
            throw new BlError("messageType is not defined").code(701);
        }
        if (message.messageSubtype === undefined || !message.messageSubtype) {
            throw new BlError("messageSubtype is not defined").code(701);
        }
        if (message.messageType === "reminder" &&
            !PermissionService.isPermissionEqualOrOver(accessToken.permission, "admin")) {
            throw new BlError("no permission").code(904);
        }
        switch (message.messageType) {
            case "custom-reminder":
            case "reminder": {
                if (message.messageType === "custom-reminder" &&
                    message.messageMethod !== "sms") {
                    throw new BlError("Cannot send custom email reminder, only SMS").code(808);
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
                throw new BlError(`MessageType "${message.messageType}" is not supported`).code(701);
            }
        }
    }
    async onGeneric(message) {
        const userDetail = await BlStorage.UserDetails.get(message.customerId).catch(() => {
            throw new BlError(`Could not find customerId ${message.customerId}`).code(702);
        });
        // Do not await to improve performance
        Messenger.send(message, userDetail).catch((error) => {
            throw new BlError(`Could not send generic message`).code(200).add(error);
        });
        return message;
    }
    async onMatch(message) {
        const userDetail = await BlStorage.UserDetails.get(message.customerId).catch(() => {
            throw new BlError(`Could not find customerId ${message.customerId}`).code(702);
        });
        // Do not await to improve performance
        Messenger.send(message, userDetail).catch((error) => {
            throw new BlError(`Could not send match message`).code(200).add(error);
        });
        return message;
    }
    async onRemind(message) {
        // Do not await to improve performance
        this.messengerReminder.remindCustomer(message).catch((error) => {
            throw new BlError(`Could not send reminder message`).code(200).add(error);
        });
        return message;
    }
}
