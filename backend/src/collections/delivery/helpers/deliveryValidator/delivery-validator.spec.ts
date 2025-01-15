import "mocha";

import { DeliveryBranchHandler } from "@backend/collections/delivery/helpers/deliveryBranch/delivery-branch-handler";
import { DeliveryBringHandler } from "@backend/collections/delivery/helpers/deliveryBring/delivery-bring-handler";
import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { OrderModel } from "@backend/collections/order/order.model";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("DeliveryValidator", () => {
  let testDelivery: Delivery;
  let testOrder: Order;
  const deliveryBranchHandler = new DeliveryBranchHandler();
  const deliveryBringHandler = new DeliveryBringHandler();
  const orderStorage = new BlStorage(OrderModel);
  const deliveryValidator = new DeliveryValidator(
    deliveryBranchHandler,
    deliveryBringHandler,
  );

  let deliveryBranchValidation = true;
  let deliveryBringValidation = true;

  sinon.stub(orderStorage, "get").callsFake((id) => {
    if (id !== testOrder.id) {
      return Promise.reject(new BlError("not found").code(702));
    }
    return Promise.resolve(testOrder);
  });

  sinon
    .stub(deliveryBranchHandler, "validate")
    .callsFake((delivery: Delivery) => {
      if (!deliveryBranchValidation) {
        return Promise.reject(
          new BlError('validation of delivery.method "branch" failed'),
        );
      }
      return Promise.resolve(true);
    });

  sinon
    .stub(deliveryBringHandler, "validate")
    .callsFake((delivery: Delivery) => {
      if (!deliveryBringValidation) {
        return Promise.reject(
          new BlError('validation of delivery.method "bring" failed'),
        );
      }
      return Promise.resolve(true);
    });

  describe("validate()", () => {
    beforeEach(() => {
      testDelivery = {
        id: "delivery1",
        method: "branch",
        info: {
          branch: "branch1",
        },
        order: "order1",
        amount: 0,
      };
      testOrder = {
        id: "order1",
        amount: 100,
        branch: "branch1",
        customer: "customer1",
        byCustomer: true,
        orderItems: [],
        pendingSignature: false,
      };
    });

    it("should reject with error when method is not defined", () => {
      // @ts-expect-error fixme: auto ignored
      testDelivery.method = null;

      return expect(
        deliveryValidator.validate(testDelivery),
      ).to.be.rejectedWith(BlError, /delivery.method not defined/);
    });

    it("should reject if delivery.method is branch and DeliveryBranchHandler.validate rejects", () => {
      deliveryBranchValidation = false;
      testDelivery.method = "branch";

      return expect(
        deliveryValidator.validate(testDelivery),
      ).to.be.rejectedWith(
        BlError,
        /validation of delivery.method "branch" failed/,
      );
    });

    it("should reject if delivery.method is bring and DeliveryBringHandler.validate rejects", () => {
      deliveryBringValidation = false;
      testDelivery.method = "bring";

      return expect(
        deliveryValidator.validate(testDelivery),
      ).to.be.rejectedWith(
        BlError,
        /validation of delivery.method "bring" failed/,
      );
    });
  });
});
