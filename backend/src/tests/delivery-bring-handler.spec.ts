import { DeliveryBringHandler } from "@backend/express/collections/delivery/helpers/deliveryBring/delivery-bring-handler.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

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
