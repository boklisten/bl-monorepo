import "mocha";
import { EmailHandler, EmailLog } from "@boklisten/bl-email";
import {
  BlError,
  UserDetail,
  CustomerItem,
  Item,
  Message,
} from "@boklisten/bl-model";
import {
  PostOffice,
  Recipient,
  MessageOptions,
} from "@boklisten/bl-post-office";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { EmailService } from "@/messenger/email/email-service";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

class MockPostOffice extends PostOffice {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super(undefined, undefined);
    this.setConfig({
      reminder: { mediums: { email: false } },
      generic: { mediums: { email: false } },
      receipt: { mediums: { email: false } },
    });
  } // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public override async send(recipients: Recipient[], options: MessageOptions) {
    return true;
  }
}

chai.use(chaiAsPromised);

describe("EmailService", () => {
  const emailHandler = new EmailHandler({ sendgrid: { apiKey: "someKey" } });
  const itemStorage = new BlDocumentStorage<Item>(BlCollectionName.Items);
  const mockPostOffice = new MockPostOffice();
  const emailService = new EmailService(
    emailHandler,
    itemStorage,
    mockPostOffice,
  );

  const itemStorageGetStub = sinon.stub(itemStorage, "get");
  const emailHandlerRemindStub = sinon.stub(emailHandler, "sendReminder");
  const postOfficeSendStub = sinon.stub(mockPostOffice, "send");

  describe("#send", () => {
    it("should call postOffice.send when message.type is generic", (done) => {
      postOfficeSendStub.resolves(true);

      const message: Message = {
        id: "message1",
        customerId: "customer1",
        messageMethod: "email",
        messageType: "generic",
        messageSubtype: "all",
        subject: "This is the subject",
        htmlContent: "<p>Hi hello</p>",
      };

      emailService
        .send(message, {
          id: "abc",
          email: "some@email.org",
        } as UserDetail)
        .then(() => {
          expect(postOfficeSendStub).to.have.been.called;
          expect(postOfficeSendStub).to.have.been.calledWith();
          done();
        });
    });
  });

  describe("#sendGeneric", () => {
    it("should call postOffice.send", (done) => {
      postOfficeSendStub.resolves(true);

      const message: Message = {
        id: "message1",
        customerId: "customer1",
        messageMethod: "email",
        messageType: "generic",
        messageSubtype: "all",
        subject: "This is the subject",
        htmlContent: "<p>Hi hello</p>",
      };

      emailService
        .sendGeneric(message, {
          id: "abc",
          email: "some@email.org",
        } as UserDetail)
        .then(() => {
          expect(postOfficeSendStub).to.have.been.called;
          expect(postOfficeSendStub).to.have.been.calledWith();
          done();
        });
    });
  });

  describe("#remind", () => {
    it("should call emailHandler.sendReminder", (done) => {
      postOfficeSendStub.reset();
      postOfficeSendStub.resolves(true);
      itemStorageGetStub.resolves({
        id: "item1",
        title: "title",
        info: { isbn: 123 },
      } as Item);

      const message: Message = {
        id: "message1",
        messageType: "reminder",
        info: {
          deadline: new Date(),
        },
      } as Message;

      emailService
        .remind(
          message,
          { id: "abc", email: "some@email.org" } as UserDetail,
          [{ id: "customerItem1" }] as CustomerItem[],
        )
        .then(() => {
          expect(postOfficeSendStub).to.have.been.calledOnce;
          done();
        });
    });

    it("should call emailHandler.sendReminder twice if userDetail.dob is under 18 and has a valid guardian", (done) => {
      postOfficeSendStub.reset();
      postOfficeSendStub.resolves(true);
      itemStorageGetStub.resolves({
        id: "item1",
        title: "title",
        info: { isbn: 123 },
      } as Item);

      const message: Message = {
        id: "message1",
        messageType: "reminder",
        info: {
          deadline: new Date(),
        },
      } as Message;

      emailService
        .remind(
          message,
          {
            id: "abc",
            email: "some@email.org",
            guardian: { email: "someOther@email.com", phone: "91804211" },
            dob: new Date(),
          } as UserDetail,
          [{ id: "customerItem1" }] as CustomerItem[],
        )
        .then(() => {
          expect(postOfficeSendStub).to.have.been.calledTwice;
          done();
        })
        .catch((err) => done(err));
    });

    it("should reject if customerItem.item does not exist", (done) => {
      itemStorageGetStub.rejects(new BlError("not found"));

      const customerDetail = {
        id: "customer1",
        name: "Some Name",
      } as UserDetail;
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

      const message: Message = {
        id: "message1",
        messageType: "reminder",
        info: {
          deadline: new Date(),
        },
      } as Message;

      emailService
        .remind(message, customerDetail, customerItems)
        .catch((err) => {
          expect(err.getMsg()).to.eq("not found");
          done();
        });
    });

    it("should convert all customerItems as emailOrderItems", (done) => {
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
      ] as CustomerItem[];

      const customerDetail = {
        id: "customer1",
        name: "Some Name",
        email: "some@email.com",
      } as UserDetail;

      const item1 = {
        id: "item1",
        info: {
          isbn: 123,
        },
        title: "Signatur 1",
      } as Item;

      const item2 = {
        id: "item2",
        info: {
          isbn: 456,
        },
        title: "Terra Mater",
      } as Item;

      const message: Message = {
        id: "message1",
        messageType: "reminder",
        messageSubtype: "partly-payment",
        info: {
          deadline: new Date(2018, 6, 1),
        },
      } as Message;

      emailHandlerRemindStub.resolves({} as EmailLog);
      itemStorageGetStub.withArgs("item1").resolves(item1);
      itemStorageGetStub.withArgs("item2").resolves(item2);

      emailService
        .remind(message, customerDetail, customerItems)
        .then(() => {
          const emailOrderItems = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            postOfficeSendStub.lastCall.args[0][0].itemList.items;

          expect(emailOrderItems).to.eql([
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

          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
