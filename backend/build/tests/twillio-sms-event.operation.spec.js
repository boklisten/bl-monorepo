import { TwilioSmsEventOperation } from "@backend/lib/collections/message/operations/twillio-sms-event.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("TwilioSmsEventOperation", (group) => {
    const twilioSmsEventOperation = new TwilioSmsEventOperation();
    let messageStorageGetIdStub;
    let messageStorageUpdateStub;
    let sandbox;
    group.each.setup(() => {
        sandbox = createSandbox();
        const messagesStub = {
            get: sandbox.stub(),
            update: sandbox.stub(),
        };
        sandbox.stub(BlStorage, "Messages").value(messagesStub);
        messageStorageGetIdStub = messagesStub.get;
        messageStorageUpdateStub = messagesStub.update;
        messageStorageUpdateStub.resolves({});
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should be rejected if blApiRequest.data is empty or undefined", async () => {
        const blApiRequest = {
            data: null,
        };
        return expect(twilioSmsEventOperation.run(blApiRequest)).to.be.rejected;
    });
    test("should be rejected if blApiRequest.query is empty or undefined", async () => {
        const blApiRequest = {
            data: {
                status: "sent",
                price: -0.0075,
                price_unit: "USD",
                body: "some message",
            },
        };
        return expect(twilioSmsEventOperation.run(blApiRequest)).to.be.rejected;
    });
    test("should get correct message based on query parameter", async () => {
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
        messageStorageUpdateStub.resolves({});
        messageStorageGetIdStub
            .withArgs("blMessage1")
            .resolves({ id: "blMessage1" });
        twilioSmsEventOperation.run(blApiRequest).then(() => {
            const arg = messageStorageGetIdStub.lastCall.args[0];
            return expect(arg).to.eq("blMessage1");
        });
    });
    test("should update correct message with sendgrid event", async () => {
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
            .resolves({ id: "blMessage1" });
        messageStorageUpdateStub.resolves({});
        twilioSmsEventOperation.run(blApiRequest).then(() => {
            const args = messageStorageUpdateStub.lastCall.args;
            expect(args[0]).to.eq("blMessage1");
            return expect(args[1]).to.eql({ smsEvents: [twilioSmsEvent] });
        });
    });
});
