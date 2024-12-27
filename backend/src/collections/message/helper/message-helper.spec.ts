import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { MessageHelper } from "@backend/collections/message/helper/message-helper";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Message } from "@shared/message/message";
import { MessageMethod } from "@shared/message/message-method/message-method";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

describe("MessageHelper", () => {
  const messageStorage = new BlDocumentStorage<Message>(
    BlCollectionName.Messages,
  );
  const messageHelper = new MessageHelper(messageStorage);

  const messageStorageGetByQueryStub = sinon.stub(messageStorage, "getByQuery");

  describe("#isAdded", () => {
    it("should throw error if messageStorage.get fails", async () => {
      const message: Message = {
        id: "abc",
        messageType: "reminder",
        messageSubtype: "partly-payment",
        messageMethod: MessageMethod.EMAIL,
        sequenceNumber: 0,
        customerId: "abc",
      };

      const errorMessage = "failed to get message";

      messageStorageGetByQueryStub.callsFake(() => {
        return Promise.reject(errorMessage);
      });

      try {
        await messageHelper.isAdded(message);
        throw new Error("should not be valid");
      } catch (e) {
        return expect(e).to.eq(errorMessage);
      }
    });

    it("should return true if type, subtype, sequence, method and customerId is already in storage", async () => {
      const message: Message = {
        id: "abc",
        messageType: "reminder",
        messageSubtype: "partly-payment",
        messageMethod: MessageMethod.EMAIL,
        sequenceNumber: 0,
        customerId: "abc",
      };

      messageStorageGetByQueryStub.callsFake(() => {
        return Promise.resolve([message]);
      });

      try {
        const isAdded = await messageHelper.isAdded(message);
        return expect(isAdded).to.be.true;
      } catch (e) {
        throw e;
      }
    });

    it("should return false if type, subtype, sequence, method and customerId is already in storage, but htmlContent is not the same as in storage", async () => {
      const message: Message = {
        id: "abc",
        messageType: "reminder",
        messageSubtype: "partly-payment",
        messageMethod: MessageMethod.EMAIL,
        sequenceNumber: 0,
        htmlContent: "<h1>This is some new html content</h1>",
        customerId: "abc",
      };

      const storedMessage: Message = {
        id: "abc",
        messageType: "reminder",
        messageSubtype: "partly-payment",
        messageMethod: MessageMethod.EMAIL,
        sequenceNumber: 0,
        htmlContent: "<h1>This is the html content already stored</h1>",
        customerId: "abc",
      };

      messageStorageGetByQueryStub.callsFake(() => {
        return Promise.resolve([storedMessage]);
      });

      try {
        const isAdded = await messageHelper.isAdded(message);
        return expect(isAdded).to.be.false;
      } catch (e) {
        throw e;
      }
    });

    it("should return false if type, subtype, sequence, method and customerId is not in storage", async () => {
      const message: Message = {
        id: "abc",
        messageType: "reminder",
        messageSubtype: "partly-payment",
        messageMethod: MessageMethod.EMAIL,
        sequenceNumber: 0,
        customerId: "abc",
      };

      messageStorageGetByQueryStub.callsFake(() => {
        return Promise.reject(new BlError("not found").code(702));
      });

      try {
        const isAdded = await messageHelper.isAdded(message);
        return expect(isAdded).to.be.false;
      } catch (e) {
        throw e;
      }
    });
  });
});
