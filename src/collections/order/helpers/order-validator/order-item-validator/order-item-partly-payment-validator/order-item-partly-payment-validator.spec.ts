import "mocha";
import { BlError, OrderItem, Item, Branch } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { OrderItemPartlyPaymentValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-partly-payment-validator/order-item-partly-payment-validator";

chai.use(chaiAsPromised);

describe("OrderItemPartlyPaymentValidator", () => {
  describe("#validate", () => {
    const orderItemPartlyPaymentValidator =
      new OrderItemPartlyPaymentValidator();

    it('should reject if orderItem.type is not "partly-payment"', () => {
      const orderItem: OrderItem = {
        type: "buy",
        item: "item1",
        title: "someTitle",
        amount: 100,
        unitPrice: 100,
        taxRate: 100,
        taxAmount: 0,
      };

      const item = {
        title: "someTitle",
      };

      const branch = {
        name: "some branch",
      };

      return expect(
        orderItemPartlyPaymentValidator.validate(
          orderItem,
          item as Item,
          branch as Branch,
        ),
      ).to.eventually.be.rejectedWith(BlError);
    });

    it("should reject if orderItem.info.to is not specified", () => {
      const orderItem = {
        type: "partly-payment",
        info: {
          from: new Date(),
        },
      };

      return expect(
        orderItemPartlyPaymentValidator.validate(
          orderItem as OrderItem,
          {} as Item,
          {} as Branch,
        ),
      ).to.eventually.be.rejectedWith(
        BlError,
        /orderItem.info.to not specified/,
      );
    });

    it("should reject if orderItem.info.amountLeftToPay is not specified", () => {
      const orderItem = {
        type: "partly-payment",
        info: {
          to: new Date(),
          from: new Date(),
        },
      };

      return expect(
        orderItemPartlyPaymentValidator.validate(
          orderItem as OrderItem,
          {} as Item,
          {} as Branch,
        ),
      ).to.eventually.be.rejectedWith(
        BlError,
        /orderItem.info.amountLeftToPay not specified/,
      );
    });

    it("should reject if orderItem.info is not specified", () => {
      const orderItem = {
        type: "partly-payment",
      };

      return expect(
        orderItemPartlyPaymentValidator.validate(
          orderItem as OrderItem,
          {} as Item,
          {} as Branch,
        ),
      ).to.eventually.be.rejectedWith(BlError, /orderItem.info not specified/);
    });

    it("should reject if orderItem.info.period is not allowed on branch", () => {
      const orderItem = {
        type: "partly-payment",
        item: "someItem",
        info: {
          to: new Date(),
          from: new Date(),
          amountLeftToPay: 100,
          periodType: "year",
        },
      } as any;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const branch = {
        name: "some branch",
        paymentInfo: {
          partlyPaymentPeriods: [
            {
              type: "semester",
              date: new Date(),
              maxNumberOfPeriods: 1,
              percentage: 0.1,
            },
          ],
        },
      };

      return expect(
        orderItemPartlyPaymentValidator.validate(
          orderItem as OrderItem,
          {} as Item,
          {} as Branch,
        ),
      ).to.eventually.be.rejectedWith(
        BlError,
        /partly-payment period \"year\" not supported on branch/,
      );
    });
  });
});
