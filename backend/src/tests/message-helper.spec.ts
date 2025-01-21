import "mocha";

import { MessageHelper } from "@backend/collections/message/helper/message-helper.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { MessageMethod } from "@shared/message/message-method/message-method.js";
import { Message } from "@shared/message/message.js";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
import sinonChai from "sinon-chai";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

describe("MessageHelper", () => {
  const messageHelper = new MessageHelper();
  let sandbox: sinon.SinonSandbox;
  let messageStorageGetByQueryStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = createSandbox();
    messageStorageGetByQueryStub = sandbox.stub(
      BlStorage.Messages,
      "getByQuery",
    );
  });
  afterEach(() => {
    sandbox.restore();
  });

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

      const isAdded = await messageHelper.isAdded(message);
      return expect(isAdded).to.be.true;
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

      const isAdded = await messageHelper.isAdded(message);
      return expect(isAdded).to.be.false;
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

      const isAdded = await messageHelper.isAdded(message);
      return expect(isAdded).to.be.false;
    });
  });
});
