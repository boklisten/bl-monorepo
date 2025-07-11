import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { UserDetailPermissionOperation } from "#services/collections/user-detail/operations/permission/user-detail-permission.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";
import { UserDetail } from "#shared/user/user-detail/user-detail";
chaiUse(chaiAsPromised);
should();

test.group("UserDetailPermissionOperation", (group) => {
  const userDetailPermissionOperation = new UserDetailPermissionOperation();

  let userAggregateStub: sinon.SinonStub;
  let userDetailGetStub: sinon.SinonStub;
  let userUpdateStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    userAggregateStub = sandbox.stub(BlStorage.Users, "aggregate");
    userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
    userUpdateStub = sandbox.stub(BlStorage.Users, "update");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if userDetail is not found", async () => {
    userDetailGetStub.rejects(new BlError("user-detail not found"));

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "admin", details: "" },
        data: { permission: "employee" },
        documentId: "userDetailX",
      }),
    ).to.eventually.be.rejectedWith(BlError, /user-detail not found/);
  });

  test("should reject if user is not found", async () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.rejects(new BlError("user not found"));

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "admin", details: "" },
        data: { permission: "employee" },
        documentId: "userDetailX",
      }),
    ).to.eventually.be.rejectedWith(BlError, /user not found/);
  });

  const permissions = ["customer", "employee", "manager", "admin"];

  for (const permission of permissions) {
    test(`should reject if blApiRequest.user.permission "${permission}" is lower than user.permission "admin"`, async () => {
      userDetailGetStub.resolves({
        id: "userDetail1",
        blid: "abcdef",
        email: "abcdef",
      } as UserDetail);
      userAggregateStub.resolves([
        { id: "userDetail1", permission: "admin" } as User,
      ]);

      return expect(
        userDetailPermissionOperation.run({
          // @ts-expect-error fixme missing params
          user: { id: "userDetail2", permission: permission, details: "" },
          documentId: "userDetail1",
          data: { permission: "employee" },
        }),
      ).to.eventually.be.rejectedWith(
        BlError,
        "no access to change permission",
      );
    });
  }

  test(`should reject if blApiRequest.user.permission is not "admin" or higher`, async () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "employee" } as User,
    ]);

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "manager", details: "" },
        documentId: "userDetail1",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(BlError, "no access to change permission");
  });

  test("should reject if trying to change users own permission", async () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "employee" } as User,
    ]);

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "manager", details: "" },
        documentId: "userDetail1",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(
      BlError,
      "user can not change own permission",
    );
  });

  test("should reject if blApiRequest.data.permission is not a valid permission", async () => {
    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: {},
      }),
    ).to.eventually.be.rejected;
  });

  test("should reject if userStorage.update rejects", async () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "customer" } as User,
    ]);
    userUpdateStub.rejects(new BlError("could not update permission"));

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(BlError, "could not update permission");
  });

  test("should resolve", async ({ assert }) => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "customer" } as User,
    ]);
    userUpdateStub.resolves({} as User);

    return assert.doesNotReject(() =>
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: { permission: "employee" },
      }),
    );
  });
});
