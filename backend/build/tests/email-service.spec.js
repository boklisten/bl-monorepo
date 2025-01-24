import { EmailService } from "@backend/lib/messenger/email/email-service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { EmailHandler } from "@boklisten/bl-email";
import { PostOffice } from "@boklisten/bl-post-office";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { MessageMethod } from "@shared/message/message-method/message-method.js";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
class MockPostOffice extends PostOffice {
    constructor() {
        // @ts-expect-error fixme: auto ignored
        super(undefined, undefined);
        this.setConfig({
            reminder: { mediums: { email: false } },
            generic: { mediums: { email: false } },
            receipt: { mediums: { email: false } },
        });
    }
    async send() {
        return true;
    }
}
chaiUse(chaiAsPromised);
should();
test.group("EmailService", (group) => {
    const emailHandler = new EmailHandler({ sendgrid: { apiKey: "someKey" } });
    const mockPostOffice = new MockPostOffice();
    const emailService = new EmailService(emailHandler, mockPostOffice);
    let sandbox;
    let itemStorageGetStub;
    let emailHandlerRemindStub;
    let postOfficeSendStub;
    group.each.setup(() => {
        sandbox = createSandbox();
        itemStorageGetStub = sandbox.stub(BlStorage.Items, "get");
        emailHandlerRemindStub = sandbox.stub(emailHandler, "sendReminder");
        postOfficeSendStub = sandbox.stub(mockPostOffice, "send");
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should call postOffice.send when message.type is generic", async () => {
        postOfficeSendStub.resolves(true);
        const message = {
            id: "message1",
            customerId: "customer1",
            messageMethod: MessageMethod.EMAIL,
            messageType: "generic",
            messageSubtype: "all",
            subject: "This is the subject",
            htmlContent: "<p>Hi hello</p>",
        };
        emailService
            .send(message, {
            id: "abc",
            email: "some@email.org",
        })
            .then(() => {
            expect(postOfficeSendStub).to.have.been.called;
            return expect(postOfficeSendStub).to.have.been.calledWith();
        });
    });
    test("should call postOffice.send", async () => {
        postOfficeSendStub.resolves(true);
        const message = {
            id: "message1",
            customerId: "customer1",
            messageMethod: MessageMethod.EMAIL,
            messageType: "generic",
            messageSubtype: "all",
            subject: "This is the subject",
            htmlContent: "<p>Hi hello</p>",
        };
        emailService
            .sendGeneric(message, {
            id: "abc",
            email: "some@email.org",
        })
            .then(() => {
            expect(postOfficeSendStub).to.have.been.called;
            return expect(postOfficeSendStub).to.have.been.calledWith();
        });
    });
    test("should call emailHandler.sendReminder", async () => {
        postOfficeSendStub.reset();
        postOfficeSendStub.resolves(true);
        itemStorageGetStub.resolves({
            id: "item1",
            title: "title",
            info: { isbn: 123 },
        });
        const message = {
            id: "message1",
            messageType: "reminder",
            info: {
                deadline: new Date(),
            },
        };
        emailService
            .remind(message, { id: "abc", email: "some@email.org" }, [{ id: "customerItem1" }])
            .then(() => {
            return expect(postOfficeSendStub).to.have.been.calledOnce;
        });
    });
    test("should call emailHandler.sendReminder twice if userDetail.dob is under 18 and has a valid guardian", async () => {
        postOfficeSendStub.reset();
        postOfficeSendStub.resolves(true);
        itemStorageGetStub.resolves({
            id: "item1",
            title: "title",
            info: { isbn: 123 },
        });
        const message = {
            id: "message1",
            messageType: "reminder",
            info: {
                deadline: new Date(),
            },
        };
        emailService
            .remind(message, {
            id: "abc",
            email: "some@email.org",
            guardian: { email: "someOther@email.com", phone: "91804211" },
            dob: new Date(),
        }, [{ id: "customerItem1" }])
            .then(() => {
            return expect(postOfficeSendStub).to.have.been.calledTwice;
        });
    });
    test("should reject if customerItem.item does not exist", async () => {
        itemStorageGetStub.rejects(new BlError("not found"));
        const customerDetail = {
            id: "customer1",
            name: "Some Name",
        };
        const customerItems = [
            {
                id: "someId",
                item: "item1",
                customer: "customer1",
                deadline: new Date(),
                handout: false,
                returned: false,
            },
        ];
        const message = {
            id: "message1",
            messageType: "reminder",
            info: {
                deadline: new Date(),
            },
        };
        emailService.remind(message, customerDetail, customerItems).catch((err) => {
            return expect(err.getMsg()).to.eq("not found");
        });
    });
    test("should convert all customerItems as emailOrderItems", async () => {
        const customerItems = [
            {
                id: "1",
                customer: "customer1",
                item: "item1",
                amountLeftToPay: 200,
                deadline: new Date(2018, 0, 1),
            },
            {
                id: "2",
                customer: "customer1",
                item: "item2",
                amountLeftToPay: 100,
                deadline: new Date(2018, 0, 1),
            },
        ];
        const customerDetail = {
            id: "customer1",
            name: "Some Name",
            email: "some@email.com",
        };
        const item1 = {
            id: "item1",
            info: {
                isbn: 123,
            },
            title: "Signatur 1",
        };
        const item2 = {
            id: "item2",
            info: {
                isbn: 456,
            },
            title: "Terra Mater",
        };
        const message = {
            id: "message1",
            messageType: "reminder",
            messageSubtype: "partly-payment",
            info: {
                deadline: new Date(2018, 6, 1),
            },
        };
        emailHandlerRemindStub.resolves({});
        itemStorageGetStub.withArgs("item1").resolves(item1);
        itemStorageGetStub.withArgs("item2").resolves(item2);
        emailService.remind(message, customerDetail, customerItems).then(() => {
            const emailOrderItems = postOfficeSendStub.lastCall.args[0][0].itemList.items;
            return expect(emailOrderItems).to.eql([
                {
                    id: "123",
                    title: "Signatur 1",
                    leftToPay: "200 NOK",
                    deadline: "01.07.18",
                },
                {
                    id: "456",
                    title: "Terra Mater",
                    leftToPay: "100 NOK",
                    deadline: "01.07.18",
                },
            ]);
        });
    });
});
