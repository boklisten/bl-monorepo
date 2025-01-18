import "mocha";

import { User } from "@backend/collections/user/user";
import { UserDetailPermissionOperation } from "@backend/collections/user-detail/operations/permission/user-detail-permission.operation";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlError } from "@shared/bl-error/bl-error";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();

describe("UserDetailPermissionOperation", () => {
  const resHandler = new SEResponseHandler();
  const userDetailPermissionOperation = new UserDetailPermissionOperation(
    resHandler,
  );

  let userAggregateStub: sinon.SinonStub;
  let userDetailGetStub: sinon.SinonStub;
  let userUpdateStub: sinon.SinonStub;
  let resHandlerStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    userAggregateStub = sandbox.stub(BlStorage.Users, "aggregate");
    userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
    userUpdateStub = sandbox.stub(BlStorage.Users, "update");
    resHandlerStub = sandbox.stub(resHandler, "sendResponse");
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should reject if userDetail is not found", () => {
    userDetailGetStub.rejects(new BlError("user-detail not found"));

    return expect(
      // @ts-expect-error fixme missing params
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "admin", details: "" },
        data: { permission: "employee" },
        documentId: "userDetailX",
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
      // @ts-expect-error fixme missing params
      userDetailPermissionOperation.run({
        user: { id: "userDetail2", permission: "admin", details: "" },
        data: { permission: "employee" },
        documentId: "userDetailX",
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
      userAggregateStub.resolves([
        { id: "userDetail1", permission: "admin" } as User,
      ]);

      return expect(
        // @ts-expect-error fixme missing params
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
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "employee" } as User,
    ]);

    return expect(
      // @ts-expect-error fixme missing params
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
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "employee" } as User,
    ]);

    return expect(
      // @ts-expect-error fixme missing params
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
      // @ts-expect-error fixme missing params
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: {},
      }),
    ).to.eventually.be.rejectedWith(BlError);
  });

  it("should reject if userStorage.update rejects", () => {
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
      // @ts-expect-error fixme missing params
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
    userAggregateStub.resolves([
      { id: "userDetail1", permission: "customer" } as User,
    ]);
    userUpdateStub.resolves({} as User);
    resHandlerStub.resolves(true);

    return expect(
      // @ts-expect-error fixme missing params
      userDetailPermissionOperation.run({
        user: { id: "userDetail1", permission: "admin", details: "" },
        documentId: "userDetail2",
        data: { permission: "employee" },
      }),
    ).to.eventually.be.true;
  });
});
