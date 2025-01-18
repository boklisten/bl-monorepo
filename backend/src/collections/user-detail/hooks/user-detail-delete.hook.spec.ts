import "mocha";

import { CustomerHaveActiveCustomerItems } from "@backend/collections/customer-item/helpers/customer-have-active-customer-items";
import { CustomerInvoiceActive } from "@backend/collections/invoice/helpers/customer-invoice-active";
import { OrderActive } from "@backend/collections/order/helpers/order-active/order-active";
import { DeleteUserService } from "@backend/collections/user-detail/helpers/delete-user-service";
import { UserCanDeleteUserDetail } from "@backend/collections/user-detail/helpers/user-can-delete-user-detail";
import { UserDetailDeleteHook } from "@backend/collections/user-detail/hooks/user-detail-delete.hook";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserDetailDeleteHook", () => {
  const customerHaveActiveCustomerItems = new CustomerHaveActiveCustomerItems();
  const haveActiveCustomerItemsStub = sinon.stub(
    customerHaveActiveCustomerItems,
    "haveActiveCustomerItems",
  );

  const testUserId = "5c88070b83d0da001a4ea01d";

  const orderActive = new OrderActive();
  const haveActiveOrdersStub = sinon.stub(orderActive, "haveActiveOrders");
  const customerInvoiceActive = new CustomerInvoiceActive();
  const haveActiveInvoicesStub = sinon.stub(
    customerInvoiceActive,
    "haveActiveInvoices",
  );
  const userCanDeleteUserDetail = new UserCanDeleteUserDetail();
  const canDeleteStub = sinon.stub(userCanDeleteUserDetail, "canDelete");
  const deleteUserService = new DeleteUserService();
  const deleteUserServiceStub = sinon.stub(deleteUserService, "deleteUser");

  const userDetailDeleteHook = new UserDetailDeleteHook(
    orderActive,
    customerHaveActiveCustomerItems,
    customerInvoiceActive,
    userCanDeleteUserDetail,
    deleteUserService,
  );

  beforeEach(() => {
    haveActiveOrdersStub.reset();
    haveActiveCustomerItemsStub.reset();
    haveActiveCustomerItemsStub.reset();
    canDeleteStub.reset();
    deleteUserServiceStub.reset();
  });

  describe("before()", () => {
    it("should reject if customer has active orders", () => {
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

    it("should reject if customer has active customer-items", () => {
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

    it("should reject if customer has active invoices", () => {
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

    it("should reject if you does not have the permission to delete the user", () => {
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

    it("should reject if you does not have the permission to delete the user", () => {
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
      ).to.eventually.be.rejectedWith(
        BlError,
        /user info could not be deleted/,
      );
    });

    it("should resolve with true if user can be deleted", () => {
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
  });
  describe("after()", () => {
    it("should resolve", () => {
      const accessToken = {
        permission: "admin",
        details: "user1",
      } as AccessToken;

      return expect(
        userDetailDeleteHook.after([], accessToken),
      ).to.eventually.be.eql([]);
    });
  });
});
