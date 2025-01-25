import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { MessageMethod } from "@shared/message/message-method/message-method.js";
import { Message } from "@shared/message/message.js";
import { AccessToken } from "@shared/token/access-token.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
import sinonChai from "sinon-chai";

import { MessagePostHook } from "#services/collections/message/hooks/message-post.hook";
import Messenger from "#services/messenger/messenger";
import { MessengerReminder } from "#services/messenger/reminder/messenger-reminder";
import { BlStorage } from "#services/storage/bl-storage";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

test.group("MessagePostHook", (group) => {
  const messengerReminder = new MessengerReminder();
  const messagePostHook = new MessagePostHook(messengerReminder);
  let messengerSendStub: sinon.SinonStub;

  let messengerReminderRemindCustomerStub: sinon.SinonStub;

  let userDetailGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  const adminAccessToken = {
    permission: "admin",
  } as AccessToken;

  group.each.setup(() => {
    sandbox = createSandbox();
    messengerSendStub = sandbox.stub(Messenger, "send");
    messengerReminderRemindCustomerStub = sandbox.stub(
      messengerReminder,
      "remindCustomer",
    );
    userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
    messengerReminderRemindCustomerStub.resolves();
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject with permission error if permission is not admin or above", async () => {
    const accessToken = {
      permission: "customer",
    } as AccessToken;

    const body: Message = {
      id: "",
      customerId: "customer1",
      messageType: "reminder",
      messageSubtype: "none",
      messageMethod: MessageMethod.EMAIL,
      info: {
        deadline: new Date(),
      },
    };

    return expect(
      messagePostHook.before(body, accessToken),
    ).to.eventually.be.rejectedWith(BlError, /no permission/);
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
    } as any;
    messengerReminderRemindCustomerStub.callsFake(() => {
      throw new BlError("something failed");
    });

    return expect(
      messagePostHook.before(message, adminAccessToken),
    ).to.eventually.be.rejectedWith(BlError);
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
    } as any;
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
    } as any;

    const userDetail = {
      id: "user1",
      name: "albert",
      email: "test@boklisten.co",
    } as UserDetail;
    messengerSendStub.resolves();
    userDetailGetStub.resolves(userDetail);

    messagePostHook.before(message, adminAccessToken).then(() => {
      expect(messengerSendStub).to.have.been.called;

      const args = messengerSendStub.lastCall;

      return expect(args).to.be.calledWith(message, userDetail);
    });
  });
});
