import {
  Message,
  BlError,
  BlapiResponse,
  SendgridEvent,
} from "@boklisten/bl-model";
import { Request, Response, NextFunction } from "express";

import { BlCollectionName } from "@/collections/bl-collection";
import { messageSchema } from "@/collections/message/message.schema";
import { logger } from "@/logger/logger";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class SendgridEventOperation implements Operation {
  private _messageStorage: BlDocumentStorage<Message>;

  constructor(messageStorage?: BlDocumentStorage<Message>) {
    this._messageStorage = messageStorage
      ? messageStorage
      : new BlDocumentStorage<Message>(
          BlCollectionName.Messages,
          messageSchema,
        );
  }

  public async run(
    blApiRequest: BlApiRequest,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req?: Request,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next?: NextFunction,
  ): Promise<BlapiResponse> {
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const blMessageId = sendgridEvent["bl_message_id"];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
    } catch (e) {
      logger.warn(`could not update sendgrid event ${e}`);
      // if we dont find the message, there is no worries in not handling it
      // this is just for logging anyway, and we can handle some losses
      return true;
    }
    return undefined;
  }

  private async updateMessageWithSendgridEvent(
    message: Message,
    sendgridEvent: SendgridEvent,
  ): Promise<boolean> {
    const newSendgridEvents =
      message.events && message.events.length > 0 ? message.events : [];

    newSendgridEvents.push(sendgridEvent);

    await this._messageStorage.update(
      message.id,
      { events: newSendgridEvents },
      { id: "SYSTEM", permission: "admin" },
    );

    logger.silly(
      `updated message "${message.id}" with sendgrid event: "${sendgridEvent["event"]}"`,
    );

    return true;
  }
}
