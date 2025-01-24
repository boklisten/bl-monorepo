import { MessagePostHook } from "@backend/lib/collections/message/hooks/message-post.hook.js";
import Messenger from "@backend/lib/messenger/messenger.js";
import { MessengerReminder } from "@backend/lib/messenger/reminder/messenger-reminder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { MessageMethod } from "@shared/message/message-method/message-method.js";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
import sinonChai from "sinon-chai";
chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);
test.group("MessagePostHook", (group) => {
    const messengerReminder = new MessengerReminder();
    const messagePostHook = new MessagePostHook(messengerReminder);
    let messengerSendStub;
    let messengerReminderRemindCustomerStub;
    let userDetailGetStub;
    let sandbox;
    const adminAccessToken = {
        permission: "admin",
    };
    group.each.setup(() => {
        sandbox = createSandbox();
        messengerSendStub = sandbox.stub(Messenger, "send");
        messengerReminderRemindCustomerStub = sandbox.stub(messengerReminder, "remindCustomer");
        userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
        messengerReminderRemindCustomerStub.resolves();
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should reject with permission error if permission is not admin or above", async () => {
        const accessToken = {
            permission: "customer",
        };
        const body = {
            id: "",
            customerId: "customer1",
            messageType: "reminder",
            messageSubtype: "none",
            messageMethod: MessageMethod.EMAIL,
            info: {
                deadline: new Date(),
            },
        };
        return expect(messagePostHook.before(body, accessToken)).to.eventually.be.rejectedWith(BlError, /no permission/);
    });
    test("should reject if messengerReminder rejects", async () => {
        const message = {
            id: "message1",
            customerId: "customer1",
            messageType: "reminder",
            messageSubtype: "none",
            messageMethod: MessageMethod.EMAIL,
            info: {
                deadline: new Date(),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        };
        messengerReminderRemindCustomerStub.callsFake(() => {
            throw new BlError("something failed");
        });
        return expect(messagePostHook.before(message, adminAccessToken)).to.eventually.be.rejectedWith(BlError);
    });
    test("should call messengerReminder", async () => {
        const message = {
            id: "message1",
            customerId: "customer1",
            messageType: "reminder",
            messageSubtype: "none",
            messageMethod: MessageMethod.EMAIL,
            info: {
                deadline: new Date(),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        };
        messengerReminderRemindCustomerStub.resolves();
        messagePostHook.before(message, adminAccessToken).then(() => {
            expect(messengerReminderRemindCustomerStub).to.have.been.called;
            const args = messengerReminderRemindCustomerStub.lastCall;
            return expect(args).to.be.calledWith(message);
        });
    });
    test("should call messenger.send", async () => {
        const message = {
            id: "message1",
            customerId: "customer1",
            messageType: "generic",
            messageSubtype: "none",
            messageMethod: MessageMethod.EMAIL,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        };
        const userDetail = {
            id: "user1",
            name: "albert",
            email: "test@boklisten.co",
        };
        messengerSendStub.resolves();
        userDetailGetStub.resolves(userDetail);
        messagePostHook.before(message, adminAccessToken).then(() => {
            expect(messengerSendStub).to.have.been.called;
            const args = messengerSendStub.lastCall;
            return expect(args).to.be.calledWith(message, userDetail);
        });
    });
});
