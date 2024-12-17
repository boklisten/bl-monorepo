import { Message, BlError, BlapiResponse } from "@boklisten/bl-model";
import { Request, Response, NextFunction } from "express";

import { BlCollectionName } from "@/collections/bl-collection";
import { messageSchema } from "@/collections/message/message.schema";
import { logger } from "@/logger/logger";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class TwilioSmsEventOperation implements Operation {
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
    //logger.info('message_id::' + blApiRequest.query['bl_message_id']);

    if (!blApiRequest.data || Object.keys(blApiRequest.data).length === 0) {
      throw new BlError("blApiRequest.data is empty").code(701);
    }

    if (
      !blApiRequest.query ||
      Object.keys(blApiRequest.query).length === 0 ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !blApiRequest.query["bl_message_id"]
    ) {
      throw new BlError("blApiRequest.query.bl_message_id is empty").code(701);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const blMessageId = blApiRequest.query["bl_message_id"];

    if (Array.isArray(blApiRequest.data)) {
      for (const twilioEvent of blApiRequest.data) {
        await this.parseAndAddTwilioEvent(twilioEvent, blMessageId);
      }
    } else {
      await this.parseAndAddTwilioEvent(blApiRequest.data, blMessageId);
    }

    return { documentName: "success", data: [] };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async parseAndAddTwilioEvent(twilioEvent, blMessageId: string) {
    if (!blMessageId) {
      logger.debug(`sendgrid event did not have a bl_message_id`);
      return true; // default is that the message dont have a blMessageId
    }

    try {
      const message = await this._messageStorage.get(blMessageId);
      await this.updateMessageWithTwilioSmsEvent(message, twilioEvent);
    } catch (e) {
      logger.warn(`could not update sendgrid event ${e}`);
      // if we dont find the message, there is no worries in not handling it
      // this is just for logging anyway, and we can handle some losses
      return true;
    }
    return undefined;
  }

  private async updateMessageWithTwilioSmsEvent(
    message: Message,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    smsEvent: any,
  ): Promise<boolean> {
    const newSmsEvents =
      message.smsEvents && message.smsEvents.length > 0
        ? message.smsEvents
        : [];

    newSmsEvents.push(smsEvent);

    await this._messageStorage.update(
      message.id,
      { smsEvents: newSmsEvents },
      { id: "SYSTEM", permission: "admin" },
    );

    logger.silly(
      `updated message "${message.id}" with sms event: "${smsEvent["status"]}"`,
    );

    return true;
  }
}
