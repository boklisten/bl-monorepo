import { logger } from "@backend/lib/config/logger.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class SendgridEventOperation {
    async run(blApiRequest) {
        if (!blApiRequest.data || Object.keys(blApiRequest.data).length === 0) {
            throw new BlError("blApiRequest.data is empty").code(701);
        }
        if (!Array.isArray(blApiRequest.data)) {
            throw new BlError("blApiRequest.data is not an array").code(701);
        }
        for (const sendgridEvent of blApiRequest.data) {
            await this.parseSendgridEvent(sendgridEvent);
        }
        return { documentName: "success", data: [] };
    }
    async parseSendgridEvent(sendgridEvent) {
        // @ts-expect-error fixme: auto ignored
        const blMessageId = sendgridEvent["bl_message_id"];
        // @ts-expect-error fixme: auto ignored
        const messageType = sendgridEvent["bl_message_type"];
        if (!blMessageId) {
            logger.debug(`sendgrid event did not have a bl_message_id`);
            return true; // default is that the message dont have a blMessageId
        }
        if (messageType !== "reminder") {
            logger.debug(`sendgrid event did not have supported bl_message_type`);
            // as of now, we only whant to collect the reminder emails
            return true;
        }
        try {
            const message = await BlStorage.Messages.get(blMessageId);
            await this.updateMessageWithSendgridEvent(message, sendgridEvent);
        }
        catch (error) {
            logger.warn(`could not update sendgrid event ${error}`);
            // if we dont find the message, there is no worries in not handling it
            // this is just for logging anyway, and we can handle some losses
            return true;
        }
        return;
    }
    async updateMessageWithSendgridEvent(message, sendgridEvent) {
        const newSendgridEvents = message.events && message.events.length > 0 ? message.events : [];
        newSendgridEvents.push(sendgridEvent);
        await BlStorage.Messages.update(message.id, {
            events: newSendgridEvents,
        });
        logger.silly(`updated message "${message.id}" with sendgrid event: "${sendgridEvent["event"]}"`);
        return true;
    }
}
