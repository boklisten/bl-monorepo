import { MessageModel } from "@backend/collections/message/message.model";
import { logger } from "@backend/logger/logger";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { Message } from "@shared/message/message";
import { SendgridEvent } from "@shared/message/message-sendgrid-event/message-sendgrid-event";

export class SendgridEventOperation implements Operation {
  private _messageStorage: BlDocumentStorage<Message>;

  constructor(messageStorage?: BlDocumentStorage<Message>) {
    this._messageStorage =
      messageStorage ?? new BlDocumentStorage(MessageModel);
  }

  public async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    if (!blApiRequest.data || Object.keys(blApiRequest.data).length === 0) {
      throw new BlError("blApiRequest.data is empty").code(701);
    }

    if (!Array.isArray(blApiRequest.data)) {
      throw new BlError("blApiRequest.data is not an array").code(701);
    }

    for (const sendgridEvent of blApiRequest.data) {
      await this.parseSendgridEvent(sendgridEvent as SendgridEvent);
    }

    return { documentName: "success", data: [] };
  }

  private async parseSendgridEvent(sendgridEvent: SendgridEvent) {
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
      const message = await this._messageStorage.get(blMessageId);
      await this.updateMessageWithSendgridEvent(message, sendgridEvent);
    } catch (error) {
      logger.warn(`could not update sendgrid event ${error}`);
      // if we dont find the message, there is no worries in not handling it
      // this is just for logging anyway, and we can handle some losses
      return true;
    }
    return;
  }

  private async updateMessageWithSendgridEvent(
    message: Message,
    sendgridEvent: SendgridEvent,
  ): Promise<boolean> {
    const newSendgridEvents =
      message.events && message.events.length > 0 ? message.events : [];

    newSendgridEvents.push(sendgridEvent);

    await this._messageStorage.update(message.id, {
      events: newSendgridEvents,
    });

    logger.silly(
      `updated message "${message.id}" with sendgrid event: "${sendgridEvent["event"]}"`,
    );

    return true;
  }
}
