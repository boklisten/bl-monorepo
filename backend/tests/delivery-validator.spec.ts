import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { DeliveryBranchHandler } from "#services/legacy/collections/delivery/helpers/deliveryBranch/delivery-branch-handler";
import { DeliveryBringHandler } from "#services/legacy/collections/delivery/helpers/deliveryBring/delivery-bring-handler";
import { DeliveryValidator } from "#services/legacy/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { StorageService } from "#services/storage_service";
import { BlError } from "#shared/bl-error";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";

chaiUse(chaiAsPromised);
should();

test.group("DeliveryValidator", (group) => {
  let testDelivery: Delivery;
  let testOrder: Order;
  const deliveryBranchHandler = new DeliveryBranchHandler();
  const deliveryBringHandler = new DeliveryBringHandler();
  const deliveryValidator = new DeliveryValidator(
    deliveryBranchHandler,
    deliveryBringHandler,
  );

  let deliveryBranchValidation = true;
  let deliveryBringValidation = true;
  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(StorageService.Orders, "get").callsFake((id) => {
      if (id !== testOrder.id) {
        return Promise.reject(new BlError("not found").code(702));
      }
      return Promise.resolve(testOrder);
    });

    sandbox.stub(deliveryBranchHandler, "validate").callsFake(() => {
      if (!deliveryBranchValidation) {
        return Promise.reject(
          new BlError('validation of delivery.method "branch" failed'),
        );
      }
      return Promise.resolve(true);
    });

    sandbox.stub(deliveryBringHandler, "validate").callsFake(() => {
      if (!deliveryBringValidation) {
        return Promise.reject(
          new BlError('validation of delivery.method "bring" failed'),
        );
      }
      return Promise.resolve(true);
    });
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
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject with error when method is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testDelivery.method = null;

    return expect(deliveryValidator.validate(testDelivery)).to.be.rejectedWith(
      BlError,
      /delivery.method not defined/,
    );
  });

  test("should reject if delivery.method is branch and DeliveryBranchHandler.validate rejects", async () => {
    deliveryBranchValidation = false;
    testDelivery.method = "branch";

    return expect(deliveryValidator.validate(testDelivery)).to.be.rejectedWith(
      BlError,
      /validation of delivery.method "branch" failed/,
    );
  });

  test("should reject if delivery.method is bring and DeliveryBringHandler.validate rejects", async () => {
    deliveryBringValidation = false;
    testDelivery.method = "bring";

    return expect(deliveryValidator.validate(testDelivery)).to.be.rejectedWith(
      BlError,
      /validation of delivery.method "bring" failed/,
    );
  });
});
