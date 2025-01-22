import { DeliveryBranchHandler } from "@backend/express/collections/delivery/helpers/deliveryBranch/delivery-branch-handler.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("DeliveryBringHandler", (group) => {
  const deliveryBranchHandler = new DeliveryBranchHandler();
  let testDelivery: Delivery;

  group.each.setup(() => {
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

  test("should reject if delivery.amount is not equal to 0", async () => {
    testDelivery.amount = 133;

    return expect(
      deliveryBranchHandler.validate(testDelivery),
    ).to.be.rejectedWith(BlError, /delivery.amount is "133" but should be "0"/);
  });
});
