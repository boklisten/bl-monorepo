import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderPlacedValidator } from "@backend/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderPlacedValidator", () => {
  describe("#validate()", () => {
    let testOrder: Order;
    const paymentStorage = new BlDocumentStorage<Payment>(
      BlCollectionName.Payments,
    );

    const deliveryStorage = new BlDocumentStorage<Delivery>(
      BlCollectionName.Deliveries,
    );
    const orderPlacedValidator = new OrderPlacedValidator(
      deliveryStorage,
      paymentStorage,
    );

    beforeEach(() => {
      testOrder = {
        id: "order1",
        amount: 450,
        orderItems: [
          {
            type: "buy",
            amount: 300,
            item: "i1",
            title: "Signatur 3",
            taxRate: 0,
            taxAmount: 0,
            unitPrice: 300,
          },
          {
            type: "rent",
            amount: 150,
            item: "i2",
            title: "Signatur 4",
            taxRate: 0,
            taxAmount: 0,
            unitPrice: 300,
          },
        ],
        customer: "customer1",
        delivery: "delivery1",
        branch: "b1",
        byCustomer: true,
        payments: ["payment1"],
        pendingSignature: false,
      };
    });

    context("when order.placed is set to false", () => {
      it("should resolve with true", () => {
        testOrder.placed = false;

        expect(orderPlacedValidator.validate(testOrder)).to.eventually.be.true;
      });
    });

    context("when order.placed is set to true", () => {
      let testPayment: Payment;
      let testDelivery: Delivery;

      beforeEach(() => {
        testOrder.placed = true;

        testPayment = {
          id: "payment1",
          method: "card",
          order: "order1",
          info: {},
          amount: 450,
          confirmed: true,
          customer: "customer1",
          branch: "branch1",
        };

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

      sinon.stub(paymentStorage, "getMany").callsFake((ids: string[]) => {
        return new Promise((resolve, reject) => {
          if (ids[0] !== "payment1") {
            return reject(new BlError("not found").code(702));
          }
          resolve([testPayment]);
        });
      });

      sinon.stub(deliveryStorage, "get").callsFake((id: string) => {
        return new Promise((resolve, reject) => {
          if (id !== "delivery1") {
            return reject(new BlError("not found").code(702));
          }

          resolve(testDelivery);
        });
      });

      it("should resolve with true if there are no payments attached", () => {
        testOrder.payments = [];

        return expect(orderPlacedValidator.validate(testOrder)).to.be.fulfilled;
      });

      it("should reject with error if delivery is not found", () => {
        testOrder.delivery = "notFoundDelivery";

        return orderPlacedValidator
          .validate(testOrder)
          .should.be.rejectedWith(
            BlError,
            /delivery "notFoundDelivery" not found/,
          );
      });

      it("should reject with error if payments is not found", () => {
        testOrder.payments = ["notFound"];

        return orderPlacedValidator
          .validate(testOrder)
          .should.be.rejectedWith(BlError, /order.payments is not found/);
      });

      it("should reject with error if payment.confirmed is false", () => {
        testPayment.confirmed = false;

        return orderPlacedValidator
          .validate(testOrder)
          .should.be.rejectedWith(BlError, /payment is not confirmed/);
      });

      it("should reject with error if total amount in payments is not equal to order.amount + delivery.amount", () => {
        testOrder.amount = 450;
        testDelivery.amount = 40;
        testPayment.amount = 100;

        return orderPlacedValidator
          .validate(testOrder)
          .should.be.rejectedWith(
            BlError,
            /total amount of payments is not equal to total of order.amount \+ delivery.amount/,
          );
      });

      it("should reject with error if total amount in order.orderItems is not equal to order.amount", () => {
        testOrder.payments = [];

        // @ts-expect-error fixme: auto ignored
        testOrder.delivery = null;
        testOrder.amount = 999;

        return orderPlacedValidator
          .validate(testOrder)
          .should.be.rejectedWith(
            BlError,
            /total of order.orderItems amount is not equal to order.amount/,
          );
      });

      it("should resolve if delivery and payments are valid according to order information", (done) => {
        orderPlacedValidator.validate(testOrder).then((resolved) => {
          expect(resolved).to.be.true;
          done();
        });
      });
    });
  });
});
