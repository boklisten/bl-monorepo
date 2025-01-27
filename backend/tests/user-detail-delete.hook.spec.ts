import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { CustomerHaveActiveCustomerItems } from "#services/collections/customer-item/helpers/customer-have-active-customer-items";
import { CustomerInvoiceActive } from "#services/collections/invoice/helpers/customer-invoice-active";
import { OrderActive } from "#services/collections/order/helpers/order-active/order-active";
import { DeleteUserService } from "#services/collections/user-detail/helpers/delete-user-service";
import { UserCanDeleteUserDetail } from "#services/collections/user-detail/helpers/user-can-delete-user-detail";
import { UserDetailDeleteHook } from "#services/collections/user-detail/hooks/user-detail-delete.hook";
import { BlError } from "#shared/bl-error/bl-error";
import { AccessToken } from "#shared/token/access-token";

chaiUse(chaiAsPromised);
should();

test.group("UserDetailDeleteHook", (group) => {
  const customerHaveActiveCustomerItems = new CustomerHaveActiveCustomerItems();

  const testUserId = "5c88070b83d0da001a4ea01d";

  const orderActive = new OrderActive();
  const customerInvoiceActive = new CustomerInvoiceActive();
  const userCanDeleteUserDetail = new UserCanDeleteUserDetail();
  const deleteUserService = new DeleteUserService();

  const userDetailDeleteHook = new UserDetailDeleteHook(
    orderActive,
    customerHaveActiveCustomerItems,
    customerInvoiceActive,
    userCanDeleteUserDetail,
    deleteUserService,
  );
  let sandbox: sinon.SinonSandbox;
  let haveActiveOrdersStub: sinon.SinonStub;
  let haveActiveCustomerItemsStub: sinon.SinonStub;
  let haveActiveInvoicesStub: sinon.SinonStub;
  let canDeleteStub: sinon.SinonStub;
  let deleteUserServiceStub: sinon.SinonStub;

  group.each.setup(() => {
    sandbox = createSandbox();
    haveActiveCustomerItemsStub = sandbox.stub(
      customerHaveActiveCustomerItems,
      "haveActiveCustomerItems",
    );
    haveActiveOrdersStub = sandbox.stub(orderActive, "haveActiveOrders");
    haveActiveInvoicesStub = sandbox.stub(
      customerInvoiceActive,
      "haveActiveInvoices",
    );
    canDeleteStub = sandbox.stub(userCanDeleteUserDetail, "canDelete");
    deleteUserServiceStub = sandbox.stub(deleteUserService, "deleteUser");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if customer has active orders", async () => {
    canDeleteStub.resolves(true);
    haveActiveOrdersStub.resolves(true);

    const accessToken = {
      iss: "",
      permission: "admin",
      details: "",
    } as AccessToken;

    return expect(
      userDetailDeleteHook.before({}, accessToken, testUserId),
    ).to.eventually.be.rejectedWith(BlError, /have active orders/);
  });

  test("should reject if customer has active customer-items", async () => {
    canDeleteStub.resolves(true);
    haveActiveOrdersStub.resolves(false);
    haveActiveCustomerItemsStub.resolves(true);

    const accessToken = {
      iss: "",
      permission: "admin",
      details: "",
    } as AccessToken;

    return expect(
      userDetailDeleteHook.before({}, accessToken, testUserId),
    ).to.eventually.be.rejectedWith(BlError, /have active customer-items/);
  });

  test("should reject if customer has active invoices", async () => {
    canDeleteStub.resolves(true);
    haveActiveOrdersStub.resolves(false);
    haveActiveCustomerItemsStub.resolves(false);
    haveActiveInvoicesStub.resolves(true);

    const accessToken = {
      iss: "",
      permission: "admin",
      details: "",
    } as AccessToken;

    return expect(
      userDetailDeleteHook.before({}, accessToken, testUserId),
    ).to.eventually.be.rejectedWith(BlError, /have active invoices/);
  });

  test("should reject if you does not have the permission to delete the user", async () => {
    haveActiveOrdersStub.resolves(false);
    haveActiveCustomerItemsStub.resolves(false);
    haveActiveInvoicesStub.resolves(false);
    canDeleteStub.resolves(false);

    const accessToken = {
      iss: "",
      permission: "admin",
      details: "user1",
    } as AccessToken;

    return expect(
      userDetailDeleteHook.before({}, accessToken, testUserId),
    ).to.eventually.be.rejectedWith(BlError, /no permission to delete user/);
  });

  test("should reject if you does not have the permission to delete the user", async () => {
    haveActiveOrdersStub.resolves(false);
    haveActiveCustomerItemsStub.resolves(false);
    haveActiveInvoicesStub.resolves(false);
    canDeleteStub.resolves(true);
    deleteUserServiceStub.rejects(
      new BlError("user info could not be deleted"),
    );

    const accessToken = {
      iss: "",
      permission: "admin",
      details: "user1",
    } as AccessToken;

    return expect(
      userDetailDeleteHook.before({}, accessToken, testUserId),
    ).to.eventually.be.rejectedWith(BlError, /user info could not be deleted/);
  });

  test("should resolve with true if user can be deleted", async () => {
    haveActiveOrdersStub.resolves(false);
    haveActiveCustomerItemsStub.resolves(false);
    haveActiveInvoicesStub.resolves(false);
    canDeleteStub.resolves(true);
    deleteUserServiceStub.resolves();

    const accessToken = {
      iss: "",
      permission: "admin",
      details: "user1",
    } as AccessToken;

    return expect(userDetailDeleteHook.before({}, accessToken, testUserId)).to
      .eventually.be.true;
  });
  test("should resolve", async () => {
    const accessToken = {
      permission: "admin",
      details: "user1",
    } as AccessToken;

    return expect(
      userDetailDeleteHook.after([], accessToken),
    ).to.eventually.be.eql([]);
  });
});
