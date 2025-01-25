import { test } from "@japa/runner";
import { Message } from "@shared/message/message.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { SendgridEventOperation } from "#services/collections/message/operations/sendgrid-event.operation";
import { BlStorage } from "#services/storage/bl-storage";

chaiUse(chaiAsPromised);
should();

test.group("SendgridEventOperation", (group) => {
  const sendgridEventOperation = new SendgridEventOperation();
  let messageStorageGetIdStub: sinon.SinonStub;
  let messageStorageUpdateStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    const messagesStub = {
      get: sandbox.stub(),
      update: sandbox.stub(),
    };
    sandbox.stub(BlStorage, "Messages").value(messagesStub);

    messageStorageGetIdStub = messagesStub.get;
    messageStorageUpdateStub = messagesStub.update;
    messageStorageUpdateStub.resolves({} as Message);
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should be rejected if blApiRequest.data is empty or undefined", async () => {
    const blApiRequest = {
      data: null,
    };

    return expect(sendgridEventOperation.run(blApiRequest)).to.be.rejected;
  });

  test("should be rejected if blApiRequest.data is not an array", async () => {
    const blApiRequest = {
      data: { something: "else" },
    };

    return expect(sendgridEventOperation.run(blApiRequest)).to.be.rejected;
  });

  test('should return true if sendgridEvent email type is not "reminder"', async () => {
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

  test("should get correct message based on info in sendgrid event", async () => {
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

    sendgridEventOperation.run(blApiRequest).then(() => {
      const arg = messageStorageGetIdStub.lastCall.args[0];

      return expect(arg).to.eq("blMessage1");
    });
  });

  test("should update correct message with sendgrid event", async () => {
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

    sendgridEventOperation.run(blApiRequest).then(() => {
      const args = messageStorageUpdateStub.lastCall.args;
      expect(args[0]).to.eq("blMessage1");
      return expect(args[1]).to.eql({ events: [sendgridEvent] });
    });
  });
});
