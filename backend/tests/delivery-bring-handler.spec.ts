import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DeliveryBringHandler } from "#services/collections/delivery/helpers/deliveryBring/delivery-bring-handler";
import { BlError } from "#shared/bl-error/bl-error";
import { Delivery } from "#shared/delivery/delivery";

chaiUse(chaiAsPromised);
should();

test.group("DeliveryBringHandler", (group) => {
  let testDelivery: Delivery;
  const deliveryBringHandler = new DeliveryBringHandler();

  group.each.setup(() => {
    testDelivery = {
      id: "delivery1",
      method: "bring",
      info: {
        amount: 100,
        estimatedDelivery: new Date(),
        taxAmount: 0,
        from: "7070",
        to: "0560",
      },
      order: "order1",
      amount: 100,
    };
  });

  test("should reject with error if delivery.info is not defined", async () => {
    // @ts-expect-error fixme: auto ignored
    testDelivery.info = undefined;

    return expect(
      deliveryBringHandler.validate(testDelivery),
    ).to.be.rejectedWith(BlError, /delivery.info not defined/);
  });

  test("should reject if delivery.info.from is empty or undefined", async () => {
    // @ts-expect-error fixme: auto ignored
    testDelivery.info = {
      amount: 100,
      estimatedDelivery: new Date(),
      taxAmount: 0,
      from: undefined,
      to: "0560",
    };

    return expect(
      deliveryBringHandler.validate(testDelivery),
    ).to.be.rejectedWith(BlError, /delivery.info.from not defined/);
  });

  test("should reject if delivery.info.from is empty or undefined", async () => {
    // @ts-expect-error fixme: auto ignored
    testDelivery.info = {
      amount: 100,
      estimatedDelivery: new Date(),
      taxAmount: 0,
      from: "7070",
      to: undefined,
    };

    return expect(
      deliveryBringHandler.validate(testDelivery),
    ).to.be.rejectedWith(BlError, /delivery.info.to not defined/);
  });
});
