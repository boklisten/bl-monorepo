import UserHandler from "@backend/express/auth/user/user.handler.js";
import { UserDetailChangeEmailOperation } from "@backend/express/collections/user-detail/operations/change-email/user-detail-change-email.operation.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { User } from "@backend/types/user.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

test.group("UserDetailChangeEmailOperation", (group) => {
  const userDetailChangeEmailOperation = new UserDetailChangeEmailOperation();

  let userDetailGetStub: sinon.SinonStub;
  let userDetailUpdateStub: sinon.SinonStub;
  let userAggregateStub: sinon.SinonStub;
  let userUpdateStub: sinon.SinonStub;
  let userHandlerGetByUsernameStub: sinon.SinonStub;
  let localLoginAggregateStub: sinon.SinonStub;
  let localLoginUpdateStub: sinon.SinonStub;
  let resHandlerSendResponseStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
    userDetailUpdateStub = sandbox.stub(BlStorage.UserDetails, "update");
    userAggregateStub = sandbox.stub(BlStorage.Users, "aggregate");
    userUpdateStub = sandbox.stub(BlStorage.Users, "update");
    userHandlerGetByUsernameStub = sandbox.stub(UserHandler, "getByUsername");
    localLoginAggregateStub = sandbox.stub(BlStorage.LocalLogins, "aggregate");
    localLoginUpdateStub = sandbox.stub(BlStorage.LocalLogins, "update");
    resHandlerSendResponseStub = sandbox.stub(
      BlResponseHandler,
      "sendResponse",
    );
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if blApiRequest.data is empty", async () => {
    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /email is not valid/);
  });

  test("should reject if userDetail is not found", async () => {
    userDetailGetStub.rejects(new BlError("user detail not found"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },

        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /user detail not found/);
  });

  test("should reject if user is not found", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.rejects(new BlError("no user found"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /no user found/);
  });

  const permissions = ["customer", "employee", "manager", "admin"];
  const higherPermissions = ["customer", "employee", "manager", "admin"];
  for (const permission of permissions) {
    for (const higherPermission of higherPermissions) {
      test(`should reject if blApiRequest.user.permission "${permission}" tries to change a higher permission "${higherPermission}"`, async () => {
        userDetailGetStub.resolves({
          blid: "blid1",
          email: "email@email.com",
        } as UserDetail);
        userAggregateStub.resolves([
          { username: "email@email.com", permission: higherPermission } as User,
        ]);
        localLoginAggregateStub.resolves([
          { username: "email@email.com" } as LocalLogin,
        ]);

        return expect(
          // @ts-expect-error fixme missing params
          userDetailChangeEmailOperation.run({
            user: { id: "userDetail2", permission: permission, details: "" },
            documentId: "userDetail1",
            data: { email: "e@mail.com", permission: "employee" },
          }),
        ).to.eventually.be.rejectedWith(BlError, "no access to change email");
      });
    }

    higherPermissions.shift();
  }

  test("should reject if local login is not found", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.resolves([
      {
        blid: "blid1",
        username: "email@email.com",
        permission: "customer",
      } as User,
    ]);
    localLoginAggregateStub.rejects(new BlError("local login not found"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /local login not found/);
  });

  test("should reject if the email is already in database", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.resolves([
      {
        blid: "blid1",
        username: "email@email.com",
        permission: "customer",
      } as User,
    ]);
    localLoginAggregateStub.resolves([
      { username: "email@email.com" } as LocalLogin,
    ]);
    userHandlerGetByUsernameStub.resolves({
      username: "alreadyAdded@email.com",
    } as User);

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "alreadyAdded@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(
      BlError,
      /email is already present in database/,
    );
  });

  test("should reject if userDetailStorage.update rejects", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.resolves([
      {
        blid: "blid1",
        username: "email@email.com",
        permission: "customer",
      } as User,
    ]);
    localLoginAggregateStub.resolves([
      { username: "email@email.com" } as LocalLogin,
    ]);
    userHandlerGetByUsernameStub.rejects(new BlError("not found"));
    userDetailUpdateStub.rejects(new BlError("could not update user detail"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /could not update user detail/);
  });

  test("should reject if user.update rejects", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.resolves([
      {
        blid: "blid1",
        username: "email@email.com",
        permission: "customer",
      } as User,
    ]);
    localLoginAggregateStub.resolves([
      { username: "email@email.com" } as LocalLogin,
    ]);
    userHandlerGetByUsernameStub.rejects(new BlError("not found"));
    userDetailUpdateStub.resolves({} as UserDetail);
    userUpdateStub.rejects(new BlError("could not update user"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /could not update user/);
  });

  test("should reject if user.update rejects", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.resolves([
      {
        blid: "blid1",
        username: "email@email.com",
        permission: "customer",
      } as User,
    ]);
    localLoginAggregateStub.resolves([
      { username: "email@email.com" } as LocalLogin,
    ]);
    userHandlerGetByUsernameStub.rejects(new BlError("not found"));
    userDetailUpdateStub.resolves({} as UserDetail);
    userUpdateStub.resolves({} as User);
    localLoginUpdateStub.rejects(new BlError("could not update local login"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /could not update local login/);
  });

  test("should resolve", async () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.resolves([
      {
        blid: "blid1",
        username: "email@email.com",
        permission: "customer",
      } as User,
    ]);
    localLoginAggregateStub.resolves([
      { username: "email@email.com" } as LocalLogin,
    ]);
    userHandlerGetByUsernameStub.rejects(new BlError("not found"));
    userDetailUpdateStub.resolves({} as UserDetail);
    userUpdateStub.resolves({} as User);
    localLoginUpdateStub.resolves({} as LocalLogin);
    resHandlerSendResponseStub.resolves(true);

    return expect(
      // @ts-expect-error fixme missing params
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.true;
  });
});
