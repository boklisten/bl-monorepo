import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Message } from "@shared/message/message";

export class MessageHelper {
  private queryBuilder: SEDbQueryBuilder;

  constructor(private messageStorage: BlDocumentStorage<Message>) {
    this.queryBuilder = new SEDbQueryBuilder();
  }

  public async isAdded(message: Message) {
    const databaseQuery = this.queryBuilder.getDbQuery(
      {
        messageType: message.messageType,
        messageSubtype: message.messageSubtype,
        messageMethod: message.messageMethod,

        // @ts-expect-error fixme: auto ignored
        sequenceNumber: message.sequenceNumber.toString(),
        customerId: message.customerId,
      },
      [
        { fieldName: "messageType", type: "string" },
        { fieldName: "messageSubtype", type: "string" },
        { fieldName: "messageMethod", type: "string" },
        { fieldName: "customerId", type: "string" },
        { fieldName: "sequenceNumber", type: "number" },
      ],
    );

    try {
      const docs = await this.messageStorage.getByQuery(databaseQuery);
      if (docs) {
        for (const document_ of docs) {
          if (
            JSON.stringify(document_.htmlContent) ===
            JSON.stringify(message.htmlContent)
          ) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      if (error instanceof BlError && error.getCode() === 702) {
        // not found
        return false;
      }
      throw error;
    }
  }
}
