import "mocha";

import { MessageModel } from "@backend/collections/message/message.model";
import { TwilioSmsEventOperation } from "@backend/collections/message/operations/twillio-sms-event.operation";
import { BlStorage } from "@backend/storage/blStorage";
import { Message } from "@shared/message/message";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("TwilioSmsEventOperation", () => {
  const messageStorage = new BlStorage(MessageModel);

  const twilioSmsEventOperation = new TwilioSmsEventOperation(messageStorage);

  const messageStorageGetIdStub = sinon.stub(messageStorage, "get");
  const messageStorageUpdateStub = sinon.stub(messageStorage, "update");

  messageStorageUpdateStub.resolves({} as Message);

  describe("#run", () => {
    it("should be rejected if blApiRequest.data is empty or undefined", () => {
      const blApiRequest = {
        data: null,
      };

      return expect(twilioSmsEventOperation.run(blApiRequest)).to.be.rejected;
    });

    it("should be rejected if blApiRequest.query is empty or undefined", () => {
      const blApiRequest = {
        data: {
          status: "sent",
          price: -0.0075,
          price_unit: "USD",
          body: "some message",
        },
        query: null,
      };

      return expect(twilioSmsEventOperation.run(blApiRequest)).to.be.rejected;
    });

    it("should get correct message based on query parameter", (done) => {
      const twilioSmsEvent = {
        status: "sent",
        price: -0.0075,
        price_unit: "USD",
        body: "some message",
      };

      const blApiRequest = {
        data: twilioSmsEvent,
        query: { bl_message_id: "blMessage1" },
      };

      messageStorageUpdateStub.resolves({} as Message);

      messageStorageGetIdStub
        .withArgs("blMessage1")
        .resolves({ id: "blMessage1" } as Message);

      twilioSmsEventOperation
        .run(blApiRequest)
        .then(() => {
          const arg = messageStorageGetIdStub.lastCall.args[0];

          expect(arg).to.eq("blMessage1");

          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("should update correct message with sendgrid event", (done) => {
      const twilioSmsEvent = {
        status: "sent",
        price: -0.0075,
        price_unit: "USD",
        body: "some message",
      };

      const blApiRequest = {
        data: [twilioSmsEvent],
        query: { bl_message_id: "blMessage1" },
      };

      messageStorageGetIdStub
        .withArgs("blMessage1")
        .resolves({ id: "blMessage1" } as Message);

      messageStorageUpdateStub.resolves({} as Message);

      twilioSmsEventOperation
        .run(blApiRequest)
        .then(() => {
          const args = messageStorageUpdateStub.lastCall.args;
          expect(args[0]).to.eq("blMessage1");
          expect(args[1]).to.eql({ smsEvents: [twilioSmsEvent] });

          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
