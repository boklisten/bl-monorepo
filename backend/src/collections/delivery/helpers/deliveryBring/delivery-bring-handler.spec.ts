import "mocha";
import { DeliveryBringHandler } from "@backend/collections/delivery/helpers/deliveryBring/delivery-bring-handler";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DeliveryBringHandler", () => {
  let testDelivery: Delivery;
  const deliveryBringHandler = new DeliveryBringHandler();

  beforeEach(() => {
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

  describe("validate()", () => {
    it("should reject with error if delivery.info is not defined", () => {
      // @ts-expect-error fixme: auto ignored
      testDelivery.info = undefined;

      return expect(
        deliveryBringHandler.validate(testDelivery),
      ).to.be.rejectedWith(BlError, /delivery.info not defined/);
    });

    it("should reject if delivery.info.from is empty or undefined", () => {
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

    it("should reject if delivery.info.from is empty or undefined", () => {
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
});
