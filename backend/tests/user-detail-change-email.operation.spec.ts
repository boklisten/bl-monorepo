import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import UserHandler from "#services/auth/user/user.handler";
import { UserDetailChangeEmailOperation } from "#services/collections/user-detail/operations/change-email/user-detail-change-email.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";
import { UserDetail } from "#shared/user/user-detail/user-detail";
chaiUse(chaiAsPromised);
should();

test.group("UserDetailChangeEmailOperation", (group) => {
  const userDetailChangeEmailOperation = new UserDetailChangeEmailOperation();

  let userDetailGetStub: sinon.SinonStub;
  let userDetailUpdateStub: sinon.SinonStub;
  let userAggregateStub: sinon.SinonStub;
  let userUpdateStub: sinon.SinonStub;
  let userHandlerGetByUsernameStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
    userDetailUpdateStub = sandbox.stub(BlStorage.UserDetails, "update");
    userAggregateStub = sandbox.stub(BlStorage.Users, "aggregate");
    userUpdateStub = sandbox.stub(BlStorage.Users, "update");
    userHandlerGetByUsernameStub = sandbox.stub(UserHandler, "getByUsername");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if blApiRequest.data is empty", async () => {
    return expect(
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

        return expect(
          userDetailChangeEmailOperation.run({
            // @ts-expect-error fixme missing params
            user: { id: "userDetail2", permission: permission, details: "" },
            documentId: "userDetail1",
            data: { email: "e@mail.com", permission: "employee" },
          }),
        ).to.eventually.be.rejectedWith(BlError, "no access to change email");
      });
    }

    higherPermissions.shift();
  }

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

  test("should resolve", async ({ assert }) => {
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
    userHandlerGetByUsernameStub.rejects(new BlError("not found"));
    userDetailUpdateStub.resolves({} as UserDetail);
    userUpdateStub.resolves({} as User);

    return assert.doesNotReject(() =>
      userDetailChangeEmailOperation.run({
        documentId: "userDetail1",
        data: { email: "change@email.com" },
        user: { id: "admin1", permission: "admin", details: "" },
      }),
    );
  });
});
