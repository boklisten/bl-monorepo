import { UserDetailPermissionOperation } from "@backend/lib/collections/user-detail/operations/permission/user-detail-permission.operation.js";
import BlResponseHandler from "@backend/lib/response/bl-response.handler.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("UserDetailPermissionOperation", (group) => {
    const userDetailPermissionOperation = new UserDetailPermissionOperation();
    let userAggregateStub;
    let userDetailGetStub;
    let userUpdateStub;
    let resHandlerStub;
    let sandbox;
    group.each.setup(() => {
        sandbox = createSandbox();
        userAggregateStub = sandbox.stub(BlStorage.Users, "aggregate");
        userDetailGetStub = sandbox.stub(BlStorage.UserDetails, "get");
        userUpdateStub = sandbox.stub(BlStorage.Users, "update");
        resHandlerStub = sandbox.stub(BlResponseHandler, "sendResponse");
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should reject if userDetail is not found", async () => {
        userDetailGetStub.rejects(new BlError("user-detail not found"));
        return expect(userDetailPermissionOperation.run({
            user: { id: "userDetail2", permission: "admin", details: "" },
            data: { permission: "employee" },
            documentId: "userDetailX",
        })).to.eventually.be.rejectedWith(BlError, /user-detail not found/);
    });
    test("should reject if user is not found", async () => {
        userDetailGetStub.resolves({
            id: "userDetail1",
            blid: "abcdef",
            email: "abcdef",
        });
        userAggregateStub.rejects(new BlError("user not found"));
        return expect(userDetailPermissionOperation.run({
            user: { id: "userDetail2", permission: "admin", details: "" },
            data: { permission: "employee" },
            documentId: "userDetailX",
        })).to.eventually.be.rejectedWith(BlError, /user not found/);
    });
    const permissions = ["customer", "employee", "manager", "admin"];
    for (const permission of permissions) {
        test(`should reject if blApiRequest.user.permission "${permission}" is lower than user.permission "admin"`, async () => {
            userDetailGetStub.resolves({
                id: "userDetail1",
                blid: "abcdef",
                email: "abcdef",
            });
            userAggregateStub.resolves([
                { id: "userDetail1", permission: "admin" },
            ]);
            return expect(userDetailPermissionOperation.run({
                // @ts-expect-error fixme missing params
                user: { id: "userDetail2", permission: permission, details: "" },
                documentId: "userDetail1",
                data: { permission: "employee" },
            })).to.eventually.be.rejectedWith(BlError, "no access to change permission");
        });
    }
    test(`should reject if blApiRequest.user.permission is not "admin" or higher`, async () => {
        userDetailGetStub.resolves({
            id: "userDetail1",
            blid: "abcdef",
            email: "abcdef",
        });
        userAggregateStub.resolves([
            { id: "userDetail1", permission: "employee" },
        ]);
        return expect(userDetailPermissionOperation.run({
            user: { id: "userDetail2", permission: "manager", details: "" },
            documentId: "userDetail1",
            data: { permission: "employee" },
        })).to.eventually.be.rejectedWith(BlError, "no access to change permission");
    });
    test("should reject if trying to change users own permission", async () => {
        userDetailGetStub.resolves({
            id: "userDetail1",
            blid: "abcdef",
            email: "abcdef",
        });
        userAggregateStub.resolves([
            { id: "userDetail1", permission: "employee" },
        ]);
        return expect(userDetailPermissionOperation.run({
            user: { id: "userDetail1", permission: "manager", details: "" },
            documentId: "userDetail1",
            data: { permission: "employee" },
        })).to.eventually.be.rejectedWith(BlError, "user can not change own permission");
    });
    test("should reject if blApiRequest.data.permission is not a valid permission", async () => {
        return expect(userDetailPermissionOperation.run({
            user: { id: "userDetail1", permission: "admin", details: "" },
            documentId: "userDetail2",
            data: {},
        })).to.eventually.be.rejectedWith(BlError);
    });
    test("should reject if userStorage.update rejects", async () => {
        userDetailGetStub.resolves({
            id: "userDetail1",
            blid: "abcdef",
            email: "abcdef",
        });
        userAggregateStub.resolves([
            { id: "userDetail1", permission: "customer" },
        ]);
        userUpdateStub.rejects(new BlError("could not update permission"));
        return expect(userDetailPermissionOperation.run({
            user: { id: "userDetail1", permission: "admin", details: "" },
            documentId: "userDetail2",
            data: { permission: "employee" },
        })).to.eventually.be.rejectedWith(BlError, "could not update permission");
    });
    test("should resolve", async ({ assert }) => {
        userDetailGetStub.resolves({
            id: "userDetail1",
            blid: "abcdef",
            email: "abcdef",
        });
        userAggregateStub.resolves([
            { id: "userDetail1", permission: "customer" },
        ]);
        userUpdateStub.resolves({});
        resHandlerStub.resolves(true);
        return assert.doesNotReject(() => userDetailPermissionOperation.run({
            user: { id: "userDetail1", permission: "admin", details: "" },
            documentId: "userDetail2",
            data: { permission: "employee" },
        }));
    });
});
