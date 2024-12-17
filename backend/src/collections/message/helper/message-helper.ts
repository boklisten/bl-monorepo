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
    const dbQuery = this.queryBuilder.getDbQuery(
      {
        messageType: message.messageType,
        messageSubtype: message.messageSubtype,
        messageMethod: message.messageMethod,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
      const docs = await this.messageStorage.getByQuery(dbQuery);
      if (docs) {
        for (const doc of docs) {
          if (
            JSON.stringify(doc.htmlContent) ===
            JSON.stringify(message.htmlContent)
          ) {
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      if (e instanceof BlError) {
        if (e.getCode() === 702) {
          // not found
          return false;
        }
      }
      throw e;
    }
  }
}
