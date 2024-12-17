import "mocha";
import { BlError, Delivery } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DeliveryBranchHandler } from "@/collections/delivery/helpers/deliveryBranch/delivery-branch-handler";

chai.use(chaiAsPromised);

describe("DeliveryBringHandler", () => {
  const deliveryBranchHandler = new DeliveryBranchHandler();
  let testDelivery: Delivery;

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
  });

  describe("validate()", () => {
    context("when delivery method is branch", () => {
      it("should reject if delivery.amount is not equal to 0", () => {
        testDelivery.amount = 133;

        return expect(
          deliveryBranchHandler.validate(testDelivery),
        ).to.be.rejectedWith(
          BlError,
          /delivery.amount is "133" but should be "0"/,
        );
      });
    });
  });
});
