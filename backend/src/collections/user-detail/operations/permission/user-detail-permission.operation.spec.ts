import "mocha";
import { BlError, UserDetail } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { BlCollectionName } from "@/collections/bl-collection";
import { User } from "@/collections/user/user";
import { UserDetailPermissionOperation } from "@/collections/user-detail/operations/permission/user-detail-permission.operation";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";
chai.use(chaiAsPromised);

describe("UserDetailPermissionOperation", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const userStorage = new BlDocumentStorage<User>(BlCollectionName.Users);
  const resHandler = new SEResponseHandler();
  const userDetailPermissionOperation = new UserDetailPermissionOperation(
    userDetailStorage,
    userStorage,
    resHandler,
  );

  const userAggregateStub = sinon.stub(userStorage, "aggregate");
  const userDetailGetStub = sinon.stub(userDetailStorage, "get");
  const userUpdateStub = sinon.stub(userStorage, "update");
  const resHandlerStub = sinon.stub(resHandler, "sendResponse");

  beforeEach(() => {
    userAggregateStub.reset();
    userDetailGetStub.reset();
    userUpdateStub.reset();
    resHandlerStub.reset();
  });

  it("should reject if userDetail is not found", () => {
    userDetailGetStub.rejects(new BlError("user-detail not found"));

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "admin", details: "" },
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(BlError, /user-detail not found/);
  });

  it("should reject if user is not found", () => {
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
      }),
    ).to.eventually.be.rejectedWith(BlError, /user not found/);
  });

  const permissions: any[] = ["customer", "employee", "manager", "admin"];

  for (const permission of permissions) {
    it(`should reject if blApiRequest.user.permission "${permission}" is lower than user.permission "admin"`, () => {
      userDetailGetStub.resolves({
        id: "userDetail1",
        blid: "abcdef",
        email: "abcdef",
      } as UserDetail);
      userAggregateStub.resolves([{ permission: "admin" } as User]);

      return expect(
        userDetailPermissionOperation.run({
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

  it(`should reject if blApiRequest.user.permission is not "admin" or higher`, () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([{ permission: "employee" } as User]);

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "manager", details: "" },
        documentId: "userDetail1",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(BlError, "no access to change permission");
  });

  it("should reject if trying to change users own permission", () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([{ permission: "employee" } as User]);

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

  it("should reject if blApiRequest.data.permission is not a valid permission", () => {
    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: {},
      }),
    ).to.eventually.be.rejectedWith(
      BlError,
      "permission is not valid or not provided",
    );
  });

  it("should reject if userStorage.update rejects", () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([{ permission: "customer" } as User]);
    userUpdateStub.rejects(new BlError("could not update permission"));

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.rejectedWith(BlError, "could not update permission");
  });

  it("should resolve", () => {
    userDetailGetStub.resolves({
      id: "userDetail1",
      blid: "abcdef",
      email: "abcdef",
    } as UserDetail);
    userAggregateStub.resolves([{ permission: "customer" } as User]);
    userUpdateStub.resolves({} as User);
    resHandlerStub.resolves(true);

    return expect(
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.true;
  });
});
