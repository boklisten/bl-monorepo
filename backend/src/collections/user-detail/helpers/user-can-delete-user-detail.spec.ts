import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { User } from "@backend/collections/user/user";
import { UserCanDeleteUserDetail } from "@backend/collections/user-detail/helpers/user-can-delete-user-detail";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chai.use(chaiAsPromised);

describe("UserCanDeleteUserDetail", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const userDetailGetIdStub = sinon.stub(userDetailStorage, "get");

  const userStorage = new BlDocumentStorage<User>(BlCollectionName.Users);
  const userGetByQueryStub = sinon.stub(userStorage, "getByQuery");

  const userCanDeleteUserDetail = new UserCanDeleteUserDetail(
    userDetailStorage,
    userStorage,
  );

  beforeEach(() => {
    userDetailGetIdStub.reset();
    userGetByQueryStub.reset();
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

    it("should be possible to delete a user with permission 'admin' if you have permission 'super'", () => {
      const accessToken: AccessToken = {
        iss: "",
        aud: "",
        iat: 0,
        exp: 0,
        sub: "",
        username: "",
        permission: "super",
        details: "userDetail1",
      };

      userDetailGetIdStub.resolves({
        id: "userDetail2",
        email: "user@test.com",
      } as UserDetail);

      userGetByQueryStub.resolves([{ permission: "admin" } as User]);

      return expect(
        userCanDeleteUserDetail.canDelete("userDetail2", accessToken),
      ).to.eventually.be.true;
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
