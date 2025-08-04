import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { UserCanDeleteUserDetail } from "#services/legacy/collections/user-detail/helpers/user-can-delete-user-detail";
import { StorageService } from "#services/storage_service";
import { AccessToken } from "#shared/access-token";
import { UserDetail } from "#shared/user-detail";
import { User } from "#types/user";

chaiUse(chaiAsPromised);
should();

test.group("UserCanDeleteUserDetail", (group) => {
  const userCanDeleteUserDetail = new UserCanDeleteUserDetail();
  let userDetailGetIdStub: sinon.SinonStub;
  let userGetByQueryStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    userDetailGetIdStub = sandbox.stub(StorageService.UserDetails, "get");
    userGetByQueryStub = sandbox.stub(StorageService.Users, "getByQuery");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should be possible to delete her own user", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "customer",
      details: "userDetail1",
    };
    userDetailGetIdStub.resolves({ id: "userDetail1" } as UserDetail);

    return expect(userCanDeleteUserDetail.canDelete("userDetail1", accessToken))
      .to.eventually.be.true;
  });

  test("should not be possible to delete a user with higher permission", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "customer",
      details: "userDetail1",
    };

    userDetailGetIdStub.resolves({
      id: "userDetail2",
      email: "user@test.com",
    } as UserDetail);

    userGetByQueryStub.resolves([{ permission: "admin" } as User]);

    return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
      .to.eventually.be.false;
  });

  test("should not be possible to delete a user with the same permission", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "admin",
      details: "userDetail1",
    };

    userDetailGetIdStub.resolves({
      id: "userDetail2",
      email: "user@test.com",
    } as UserDetail);

    userGetByQueryStub.resolves([{ permission: "admin" } as User]);

    return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
      .to.eventually.be.false;
  });

  test("should not be possible to delete another user if your permission is below admin", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "manager",
      details: "userDetail1",
    };

    userDetailGetIdStub.resolves({
      id: "userDetail2",
      email: "user@test.com",
    } as UserDetail);

    userGetByQueryStub.resolves([{ permission: "customer" } as User]);

    return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
      .to.eventually.be.false;
  });

  test("should be possible to delete a user with permission 'manager' if you have permission 'admin'", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "admin",
      details: "userDetail1",
    };

    userDetailGetIdStub.resolves({
      id: "userDetail2",
      email: "user@test.com",
    } as UserDetail);

    userGetByQueryStub.resolves([{ permission: "manager" } as unknown as User]);

    return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
      .to.eventually.be.true;
  });

  test("should be possible to delete a user with permission 'employee' if you have permission 'admin'", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "admin",
      details: "userDetail1",
    };

    userDetailGetIdStub.resolves({
      id: "userDetail2",
      email: "user@test.com",
    } as UserDetail);

    userGetByQueryStub.resolves([{ permission: "employee" } as User]);

    return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
      .to.eventually.be.true;
  });

  test("should be possible to delete a user with permission 'customer' if you have permission 'admin'", async () => {
    const accessToken: AccessToken = {
      iss: "",
      aud: "",
      iat: 0,
      exp: 0,
      sub: "",
      username: "",
      permission: "admin",
      details: "userDetail1",
    };

    userDetailGetIdStub.resolves({
      id: "userDetail2",
      email: "user@test.com",
    } as UserDetail);

    userGetByQueryStub.resolves([{ permission: "customer" } as User]);

    return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
      .to.eventually.be.true;
  });
});
