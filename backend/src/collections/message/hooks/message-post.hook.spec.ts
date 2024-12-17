import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { MessagePostHook } from "@backend/collections/message/hooks/message-post.hook";
import { Messenger } from "@backend/messenger/messenger";
import { MessengerReminder } from "@backend/messenger/reminder/messenger-reminder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Message } from "@shared/message/message";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("MessagePostHook", () => {
  const messengerReminder = new MessengerReminder();
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const messenger = new Messenger();
  const messagePostHook = new MessagePostHook(
    messengerReminder,
    messenger,
    userDetailStorage,
  );
  const messengerSendStub = sinon.stub(messenger, "send");

  const messengerReminderRemindCustomerStub = sinon.stub(
    messengerReminder,
    "remindCustomer",
  );

  const userDetailGetStub = sinon.stub(userDetailStorage, "get");

  const adminAccessToken = {
    permission: "admin",
  } as AccessToken;

  describe("#before", () => {
    messengerReminderRemindCustomerStub.resolves();

    beforeEach(() => {
      messengerReminderRemindCustomerStub.reset();
    });

    it("should reject with permission error if permission is not admin or above", () => {
      const accessToken = {
        permission: "customer",
      } as AccessToken;

      const body: Message = {
        id: "",
        customerId: "customer1",
        messageType: "reminder",
        messageSubtype: "none",
        messageMethod: "all",
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
          messageMethod: "email",
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
          messageMethod: "email",
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
