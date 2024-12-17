import "mocha";
import { BlError, UserDetail } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { UserHandler } from "@/auth/user/user.handler";
import { BlCollectionName } from "@/collections/bl-collection";
import { LocalLogin } from "@/collections/local-login/local-login";
import { User } from "@/collections/user/user";
import { UserDetailChangeEmailOperation } from "@/collections/user-detail/operations/change-email/user-detail-change-email.operation";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";
chai.use(chaiAsPromised);

describe("UserDetailChangeEmailOperation", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const userStorage = new BlDocumentStorage<User>(BlCollectionName.Users);
  const localLoginStorage = new BlDocumentStorage<LocalLogin>(
    BlCollectionName.LocalLogins,
  );
  const userHandler = new UserHandler();
  const resHandler = new SEResponseHandler();

  const userDetailChangeEmailOperation = new UserDetailChangeEmailOperation(
    userDetailStorage,
    userStorage,
    localLoginStorage,
    userHandler,
    resHandler,
  );

  const userDetailGetStub = sinon.stub(userDetailStorage, "get");
  const userDetailUpdateStub = sinon.stub(userDetailStorage, "update");
  const userAggregateStub = sinon.stub(userStorage, "aggregate");
  const userUpdateStub = sinon.stub(userStorage, "update");
  const userHandlerGetByUsernameStub = sinon.stub(userHandler, "getByUsername");
  const localLoginAggregateStub = sinon.stub(localLoginStorage, "aggregate");
  const localLoginUpdateStub = sinon.stub(localLoginStorage, "update");
  const resHandlerSendResponseStub = sinon.stub(resHandler, "sendResponse");

  beforeEach(() => {
    userDetailGetStub.reset();
    userDetailUpdateStub.reset();
    userAggregateStub.reset();
    userUpdateStub.reset();
    userHandlerGetByUsernameStub.reset();
    localLoginAggregateStub.reset();
    localLoginUpdateStub.reset();
    resHandlerSendResponseStub.reset();
  });

  it("should reject if blApiRequest.data is empty", () => {
    return expect(
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /email is not valid/);
  });

  it("should reject if userDetail is not found", () => {
    userDetailGetStub.rejects(new BlError("user detail not found"));

    return expect(
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },

        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /user detail not found/);
  });

  it("should reject if user is not found", () => {
    userDetailGetStub.resolves({
      blid: "blid1",
      email: "email@email.com",
    } as UserDetail);
    userAggregateStub.rejects(new BlError("no user found"));

    return expect(
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /no user found/);
  });

  const permissions: any[] = ["customer", "employee", "manager", "admin"];
  const higherPermissions: any[] = ["customer", "employee", "manager", "admin"];
  for (const permission of permissions) {
    for (const higherPermission of higherPermissions) {
      it(`should reject if blApiRequest.user.permission "${permission}" tries to change a higher permission "${higherPermission}"`, () => {
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

  it("should reject if local login is not found", () => {
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
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /local login not found/);
  });

  it("should reject if the email is already in database", () => {
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

  it("should reject if userDetailStorage.update rejects", () => {
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
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /could not update user detail/);
  });

  it("should reject if user.update rejects", () => {
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
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /could not update user/);
  });

  it("should reject if user.update rejects", () => {
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
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /could not update local login/);
  });

  it("should resolve", () => {
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
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    ).to.eventually.be.true;
  });
});
