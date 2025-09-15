import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { UserDetailPermissionOperation } from "#services/legacy/collections/user-detail/operations/permission/user-detail-permission.operation";
import { StorageService } from "#services/storage_service";
import { UserService } from "#services/user_service";
import { BlError } from "#shared/bl-error";
import { User } from "#types/user";
chaiUse(chaiAsPromised);
should();

test.group("UserDetailPermissionOperation", (group) => {
  const userDetailPermissionOperation = new UserDetailPermissionOperation();

  let getByUserDetailsId: sinon.SinonStub;
  let userUpdateStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    getByUserDetailsId = sandbox.stub(UserService, "getByUserDetailsId");
    userUpdateStub = sandbox.stub(StorageService.Users, "update");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if user is not found", async () => {
    getByUserDetailsId.rejects(new BlError("user not found"));

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
      getByUserDetailsId.resolves({
        id: "userDetail1",
        permission: "admin",
      } as User);

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
    getByUserDetailsId.resolves({
      id: "userDetail1",
      permission: "employee",
    } as User);

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "manager", details: "" },
        documentId: "userDetail1",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(BlError, "no access to change permission");
  });

  test("should reject if trying to change users own permission", async () => {
    getByUserDetailsId.resolves({
      id: "userDetail1",
      permission: "employee",
    } as User);

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
    getByUserDetailsId.resolves({
      id: "userDetail1",
      permission: "customer",
    } as User);
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
    getByUserDetailsId.resolves({
      id: "userDetail1",
      permission: "customer",
    } as User);
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
