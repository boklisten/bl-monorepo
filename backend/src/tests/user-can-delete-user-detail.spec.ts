import "mocha";

import { UserCanDeleteUserDetail } from "@backend/collections/user-detail/helpers/user-can-delete-user-detail.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { User } from "@backend/types/user.js";
import { AccessToken } from "@shared/token/access-token.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserCanDeleteUserDetail", () => {
  const userCanDeleteUserDetail = new UserCanDeleteUserDetail();
  let userDetailGetIdStub: sinon.SinonStub;
  let userGetByQueryStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    userDetailGetIdStub = sandbox.stub(BlStorage.UserDetails, "get");
    userGetByQueryStub = sandbox.stub(BlStorage.Users, "getByQuery");
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("canDelete()", () => {
    it("should be possible to delete her own user", () => {
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

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail1", accessToken),
      ).to.eventually.be.true;
    });

    it("should not be possible to delete a user with higher permission", () => {
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

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.false;
    });

    it("should not be possible to delete a user with the same permission", () => {
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

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.false;
    });

    it("should not be possible to delete another user if your permission is below admin", () => {
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

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.false;
    });

    it("should be possible to delete a user with permission 'manager' if you have permission 'admin'", () => {
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

      userGetByQueryStub.resolves([
        { permission: "manager" } as unknown as User,
      ]);

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.true;
    });

    it("should be possible to delete a user with permission 'employee' if you have permission 'admin'", () => {
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

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.true;
    });

    it("should be possible to delete a user with permission 'customer' if you have permission 'admin'", () => {
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

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.true;
    });
  });
});
