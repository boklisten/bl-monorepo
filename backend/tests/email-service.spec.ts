import { EmailHandler } from "@boklisten/bl-email";
import { PostOffice } from "@boklisten/bl-post-office";
import { test } from "@japa/runner";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { EmailService } from "#services/messenger/email/email-service";
import { Message } from "#shared/message/message";
import { MessageMethod } from "#shared/message/message-method/message-method";
import { UserDetail } from "#shared/user/user-detail/user-detail";

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
  public override async send() {
    return true;
  }
}

chaiUse(chaiAsPromised);
should();

test.group("EmailService", (group) => {
  const emailHandler = new EmailHandler({ sendgrid: { apiKey: "someKey" } });
  const mockPostOffice = new MockPostOffice();
  const emailService = new EmailService(emailHandler, mockPostOffice);

  let sandbox: sinon.SinonSandbox;
  let postOfficeSendStub: sinon.SinonStub;
  group.each.setup(() => {
    sandbox = createSandbox();
    postOfficeSendStub = sandbox.stub(mockPostOffice, "send");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should call postOffice.send when message.type is generic", async () => {
    postOfficeSendStub.resolves(true);

    const message: Message = {
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
      } as UserDetail)
      .then(() => {
        expect(postOfficeSendStub).to.have.been.called;
        return expect(postOfficeSendStub).to.have.been.calledWith();
      });
  });

  test("should call postOffice.send", async () => {
    postOfficeSendStub.resolves(true);

    const message: Message = {
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
      } as UserDetail)
      .then(() => {
        expect(postOfficeSendStub).to.have.been.called;
        return expect(postOfficeSendStub).to.have.been.calledWith();
      });
  });
});
