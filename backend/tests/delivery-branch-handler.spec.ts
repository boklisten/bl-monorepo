import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DeliveryBranchHandler } from "#services/legacy/collections/delivery/helpers/deliveryBranch/delivery-branch-handler";
import { BlError } from "#shared/bl-error";
import { Delivery } from "#shared/delivery/delivery";

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
