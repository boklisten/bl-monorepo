import "mocha";

import { SendgridEventOperation } from "@backend/collections/message/operations/sendgrid-event.operation.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { Message } from "@shared/message/message.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("SendgridEventOperation", () => {
  const sendgridEventOperation = new SendgridEventOperation();
  let messageStorageGetIdStub: sinon.SinonStub;
  let messageStorageUpdateStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    const messagesStub = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    sandbox.stub(BlStorage, "Messages").value(messagesStub);

    messageStorageGetIdStub = messagesStub.get;
    messageStorageUpdateStub = messagesStub.update;
    messageStorageUpdateStub.resolves({} as Message);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#run", () => {
    it("should be rejected if blApiRequest.data is empty or undefined", () => {
      const blApiRequest = {
        data: null,
      };

      return expect(sendgridEventOperation.run(blApiRequest)).to.be.rejected;
    });

    it("should be rejected if blApiRequest.data is not an array", () => {
      const blApiRequest = {
        data: { something: "else" },
      };

      return expect(sendgridEventOperation.run(blApiRequest)).to.be.rejected;
    });

    it('should return true if sendgridEvent email type is not "reminder"', () => {
      const blApiRequest = {
        data: [
          {
            unique_args: {
              type: "receipt",
            },
          },
        ],
      };

      return expect(sendgridEventOperation.run(blApiRequest)).to.eventually.be
        .fulfilled;
    });

    it("should get correct message based on info in sendgrid event", (done) => {
      const sendgridEvent = {
        email: "some@email.com",
        timestamp: 1234,
        "smtp-id": "<abc>",
        event: "bounce",
        category: "reminder",
        sg_event_id: "abcde",
        sg_message_id: "1234",
        bl_message_id: "blMessage1",
        bl_message_type: "reminder",
      };

      const blApiRequest = { data: [sendgridEvent] };

      messageStorageUpdateStub.resolves({} as Message);

      messageStorageGetIdStub
        .withArgs("blMessage1")
        .resolves({ id: "blMessage1" } as Message);

      sendgridEventOperation
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
      const sendgridEvent = {
        email: "some@email.com",
        timestamp: 1234,
        "smtp-id": "<abc>",
        event: "bounce",
        category: "reminder",
        sg_event_id: "abcde",
        sg_message_id: "1234",
        bl_message_id: "blMessage1",
        bl_message_type: "reminder",
      };

      const blApiRequest = { data: [sendgridEvent] };

      messageStorageGetIdStub
        .withArgs("blMessage1")
        .resolves({ id: "blMessage1" } as Message);

      messageStorageUpdateStub.resolves({} as Message);

      sendgridEventOperation
        .run(blApiRequest)
        .then(() => {
          const args = messageStorageUpdateStub.lastCall.args;
          expect(args[0]).to.eq("blMessage1");
          expect(args[1]).to.eql({ events: [sendgridEvent] });

          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
