import { UserCanDeleteUserDetail } from "@backend/lib/collections/user-detail/helpers/user-can-delete-user-detail.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("UserCanDeleteUserDetail", (group) => {
    const userCanDeleteUserDetail = new UserCanDeleteUserDetail();
    let userDetailGetIdStub;
    let userGetByQueryStub;
    let sandbox;
    group.each.setup(() => {
        sandbox = createSandbox();
        userDetailGetIdStub = sandbox.stub(BlStorage.UserDetails, "get");
        userGetByQueryStub = sandbox.stub(BlStorage.Users, "getByQuery");
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should be possible to delete her own user", async () => {
        const accessToken = {
            iss: "",
            aud: "",
            iat: 0,
            exp: 0,
            sub: "",
            username: "",
            permission: "customer",
            details: "userDetail1",
        };
        userDetailGetIdStub.resolves({ id: "userDetail1" });
        return expect(userCanDeleteUserDetail.canDelete("userDetail1", accessToken))
            .to.eventually.be.true;
    });
    test("should not be possible to delete a user with higher permission", async () => {
        const accessToken = {
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
        });
        userGetByQueryStub.resolves([{ permission: "admin" }]);
        return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
            .to.eventually.be.false;
    });
    test("should not be possible to delete a user with the same permission", async () => {
        const accessToken = {
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
        });
        userGetByQueryStub.resolves([{ permission: "admin" }]);
        return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
            .to.eventually.be.false;
    });
    test("should not be possible to delete another user if your permission is below admin", async () => {
        const accessToken = {
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
        });
        userGetByQueryStub.resolves([{ permission: "customer" }]);
        return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
            .to.eventually.be.false;
    });
    test("should be possible to delete a user with permission 'manager' if you have permission 'admin'", async () => {
        const accessToken = {
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
        });
        userGetByQueryStub.resolves([{ permission: "manager" }]);
        return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
            .to.eventually.be.true;
    });
    test("should be possible to delete a user with permission 'employee' if you have permission 'admin'", async () => {
        const accessToken = {
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
        });
        userGetByQueryStub.resolves([{ permission: "employee" }]);
        return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
            .to.eventually.be.true;
    });
    test("should be possible to delete a user with permission 'customer' if you have permission 'admin'", async () => {
        const accessToken = {
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
        });
        userGetByQueryStub.resolves([{ permission: "customer" }]);
        return expect(userCanDeleteUserDetail.canDelete("userDetail2", accessToken))
            .to.eventually.be.true;
    });
});
