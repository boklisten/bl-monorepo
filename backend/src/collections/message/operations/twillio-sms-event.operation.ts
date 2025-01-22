import { logger } from "@backend/express-config/logger.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Message } from "@shared/message/message.js";

export class TwilioSmsEventOperation implements Operation {
  public async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    if (!blApiRequest.data || Object.keys(blApiRequest.data).length === 0) {
      throw new BlError("blApiRequest.data is empty").code(701);
    }

    if (
      !blApiRequest.query ||
      Object.keys(blApiRequest.query).length === 0 ||
      !blApiRequest.query["bl_message_id"]
    ) {
      throw new BlError("blApiRequest.query.bl_message_id is empty").code(701);
    }

    const blMessageId = blApiRequest.query["bl_message_id"]?.toString();

    if (Array.isArray(blApiRequest.data)) {
      for (const twilioEvent of blApiRequest.data) {
        await this.parseAndAddTwilioEvent(twilioEvent, blMessageId);
      }
    } else {
      await this.parseAndAddTwilioEvent(blApiRequest.data, blMessageId);
    }

    return { documentName: "success", data: [] };
  }

  private async parseAndAddTwilioEvent(
    twilioEvent: unknown,
    blMessageId: string,
  ) {
    if (!blMessageId) {
      logger.debug(`sendgrid event did not have a bl_message_id`);
      return true; // default is that the message dont have a blMessageId
    }

    try {
      const message = await BlStorage.Messages.get(blMessageId);
      await this.updateMessageWithTwilioSmsEvent(message, twilioEvent);
    } catch (error) {
      logger.warn(`could not update sendgrid event ${error}`);
      // if we dont find the message, there is no worries in not handling it
      // this is just for logging anyway, and we can handle some losses
      return true;
    }
    return;
  }

  private async updateMessageWithTwilioSmsEvent(
    message: Message,
    smsEvent: unknown,
  ): Promise<boolean> {
    const newSmsEvents =
      message.smsEvents && message.smsEvents.length > 0
        ? message.smsEvents
        : [];

    newSmsEvents.push(smsEvent);

    await BlStorage.Messages.update(message.id, { smsEvents: newSmsEvents });

    logger.silly(
      // @ts-expect-error fixme bad types
      `updated message "${message.id}" with sms event: "${smsEvent["status"]}"`,
    );

    return true;
  }
}
