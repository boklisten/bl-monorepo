import { CustomerHaveActiveCustomerItems } from "@backend/collections/customer-item/helpers/customer-have-active-customer-items.js";
import { CustomerInvoiceActive } from "@backend/collections/invoice/helpers/customer-invoice-active.js";
import { OrderActive } from "@backend/collections/order/helpers/order-active/order-active.js";
import { DeleteUserService } from "@backend/collections/user-detail/helpers/delete-user-service.js";
import { UserCanDeleteUserDetail } from "@backend/collections/user-detail/helpers/user-can-delete-user-detail.js";
import { UserDetailDeleteHook } from "@backend/collections/user-detail/hooks/user-detail-delete.hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { AccessToken } from "@shared/token/access-token.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserDetailDeleteHook", () => {
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

  beforeEach(() => {
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
  afterEach(() => {
    sandbox.restore();
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
