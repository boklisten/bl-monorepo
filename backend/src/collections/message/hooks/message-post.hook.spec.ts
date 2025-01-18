import "mocha";

import { MessagePostHook } from "@backend/collections/message/hooks/message-post.hook";
import { Messenger } from "@backend/messenger/messenger";
import { MessengerReminder } from "@backend/messenger/reminder/messenger-reminder";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlError } from "@shared/bl-error/bl-error";
import { Message } from "@shared/message/message";
import { MessageMethod } from "@shared/message/message-method/message-method";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
import sinonChai from "sinon-chai";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

describe("MessagePostHook", () => {
  const messengerReminder = new MessengerReminder();
  const messenger = new Messenger();
  const messagePostHook = new MessagePostHook(messengerReminder, messenger);
  let messengerSendStub: sinon.SinonStub;

  let messengerReminderRemindCustomerStub: sinon.SinonStub;

  let userDetailGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  const adminAccessToken = {
    permission: "admin",
  } as AccessToken;

  beforeEach(() => {
    sandbox = createSandbox();
    messengerSendStub = sandbox.stub(messenger, "send");
    messengerReminderRemindCustomerStub = sandbox.stub(
      messengerReminder,
      "remindCustomer",
    );
    userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
    messengerReminderRemindCustomerStub.resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("#before", () => {
    it("should reject with permission error if permission is not admin or above", () => {
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

    context('when messageType is "reminder"', () => {
      let message: Message;

      beforeEach(() => {
        message = {
          id: "message1",
          customerId: "customer1",
          messageType: "reminder",
          messageSubtype: "none",
          messageMethod: MessageMethod.EMAIL,
          info: {
            deadline: new Date(),
          },
        };
      });

      it("should reject if messengerReminder rejects", () => {
        messengerReminderRemindCustomerStub.rejects(
          new BlError("something failed"),
        );

        expect(
          messagePostHook.before(message, adminAccessToken),
        ).to.eventually.be.rejectedWith(BlError);
      });

      it("should call messengerReminder", (done) => {
        messengerReminderRemindCustomerStub.resolves();

        messagePostHook
          .before(message, adminAccessToken)
          .then(() => {
            expect(messengerReminderRemindCustomerStub).to.have.been.called;

            const args = messengerReminderRemindCustomerStub.lastCall;

            expect(args).to.be.calledWith(message);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('when messageType is "generic"', () => {
      let message: Message;
      let userDetail: UserDetail;

      beforeEach(() => {
        message = {
          id: "message1",
          customerId: "customer1",
          messageType: "generic",
          messageSubtype: "none",
          messageMethod: MessageMethod.EMAIL,
        };

        userDetail = {
          id: "user1",
          name: "albert",
          email: "test@boklisten.co",
        } as UserDetail;
      });

      it("should call messenger.send", (done) => {
        messengerSendStub.resolves();
        userDetailGetStub.resolves(userDetail);

        messagePostHook
          .before(message, adminAccessToken)
          .then(() => {
            expect(messengerSendStub).to.have.been.called;

            const args = messengerSendStub.lastCall;

            expect(args).to.be.calledWith(message, userDetail);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });
});
