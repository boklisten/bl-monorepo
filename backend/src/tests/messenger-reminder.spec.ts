import { CustomerItemHandler } from "@backend/lib/collections/customer-item/helpers/customer-item-handler.js";
import { EmailService } from "@backend/lib/messenger/email/email-service.js";
import { MessengerReminder } from "@backend/lib/messenger/reminder/messenger-reminder.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { Message } from "@shared/message/message.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("MessengerReminder", (group) => {
  let customerItemHandler: CustomerItemHandler;
  let emailService: EmailService;

  let messengerReminder: MessengerReminder;
  let sandbox: sinon.SinonSandbox;
  let emailServiceRemindStub: sinon.SinonStub;
  let getNotReturnedStub: sinon.SinonStub;
  let userDetailStorageGetStub: sinon.SinonStub;

  group.each.setup(() => {
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
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should throw error if no customerId is provided", async () => {
    const message = {
      info: {
        deadline: new Date(),
      },
    };

    messengerReminder.remindCustomer(message as Message).catch((err) => {
      return expect(err.getMsg()).to.contain("customerId is null or undefined");
    });
  });

  test("should throw error if deadline is not provided", async () => {
    const message = {
      customerId: "customer1",
    };

    messengerReminder.remindCustomer(message as Message).catch((err) => {
      return expect(err.getMsg()).to.contain("deadline is null or undefined");
    });
  });

  test("should call customerItemHandler to get not returned customerItems", async () => {
    getNotReturnedStub.onFirstCall().resolves([]);

    const message = {
      customerId: "customer1",
      info: {
        deadline: new Date(),
      },
    };

    messengerReminder.remindCustomer(message as Message).then(() => {
      return expect(getNotReturnedStub).to.be.calledOnce;
    });
  });

  test("should call emailService.remind with correct arguments", async () => {
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

    messengerReminder.remindCustomer(message as Message).then(() => {
      return expect(emailServiceRemindStub).calledWith(
        message,
        customerDetail,
        customerItems,
      );
    });
  });
});
