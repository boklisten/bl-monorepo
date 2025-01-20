import "mocha";

import { CustomerItemHandler } from "@backend/collections/customer-item/helpers/customer-item-handler.js";
import { EmailService } from "@backend/messenger/email/email-service.js";
import { MessengerReminder } from "@backend/messenger/reminder/messenger-reminder.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { Message } from "@shared/message/message.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("MessengerReminder", () => {
  let customerItemHandler: CustomerItemHandler;
  let emailService: EmailService;

  let messengerReminder: MessengerReminder;
  let sandbox: sinon.SinonSandbox;
  let emailServiceRemindStub: sinon.SinonStub;
  let getNotReturnedStub: sinon.SinonStub;
  let userDetailStorageGetStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = createSandbox();
    customerItemHandler = new CustomerItemHandler();
    emailService = new EmailService();
    messengerReminder = new MessengerReminder(
      customerItemHandler,
      emailService,
    );
    const customerItemsStub = {
      getAll: sandbox.stub(),
      getByQuery: sandbox.stub(),
    };
    sandbox.stub(BlStorage, "CustomerItems").value(customerItemsStub);

    const userDetailsStub = {
      get: sandbox.stub(),
    };
    sandbox.stub(BlStorage, "UserDetails").value(userDetailsStub);
    getNotReturnedStub = sandbox.stub(customerItemHandler, "getNotReturned");
    emailServiceRemindStub = sandbox.stub(emailService, "remind");
    userDetailStorageGetStub = userDetailsStub.get;
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#remindCustomer", () => {
    it("should throw error if no customerId is provided", (done) => {
      const message = {
        info: {
          deadline: new Date(),
        },
      };

      messengerReminder.remindCustomer(message as Message).catch((err) => {
        expect(err.getMsg()).to.contain("customerId is null or undefined");

        done();
      });
    });

    it("should throw error if deadline is not provided", (done) => {
      const message = {
        customerId: "customer1",
      };

      messengerReminder.remindCustomer(message as Message).catch((err) => {
        expect(err.getMsg()).to.contain("deadline is null or undefined");

        done();
      });
    });

    it("should call customerItemHandler to get not returned customerItems", (done) => {
      getNotReturnedStub.onFirstCall().resolves([]);

      const message = {
        customerId: "customer1",
        info: {
          deadline: new Date(),
        },
      };

      messengerReminder.remindCustomer(message as Message).then(() => {
        expect(getNotReturnedStub).to.be.calledOnce;
        done();
      });
    });

    it("should call emailService.remind with correct arguments", (done) => {
      const customerItems = [
        {
          id: "customerItem1",
          deadline: new Date(2018, 0, 1),
          title: "",
        } as unknown as CustomerItem,
      ];

      const customerDetail: UserDetail = {
        id: "customer1",
        name: "albert",
        address: "Abc 123",
        email: "some@email.com",
        phone: "123",
        branch: "branch1",
        postCode: "0123",
        postCity: "oslo",
        country: "norway",
        dob: new Date(),
        signatures: [],
        blid: "",
      };

      const textBlocks = [
        {
          text: "Hi there, this is a textblock",
        },
      ];

      getNotReturnedStub.resolves(customerItems);
      userDetailStorageGetStub.resolves(customerDetail);
      emailServiceRemindStub.resolves(true);

      const message = {
        id: "message1",
        customerId: "customer1",
        info: {
          deadline: new Date(),
        },
        textBlocks: textBlocks,
      };

      messengerReminder
        .remindCustomer(message as Message)
        .then(() => {
          expect(emailServiceRemindStub).calledWith(
            message,
            customerDetail,
            customerItems,
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
