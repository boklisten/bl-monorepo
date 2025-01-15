import "mocha";

import { OrderItemRentPeriodValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-period-validator/order-item-rent-period-validator";
import { OrderModel } from "@backend/collections/order/order.model";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderItemRentPeriodValidator", () => {
  const orderStorage = new BlStorage(OrderModel);
  const orderItemRentPeriodValidator = new OrderItemRentPeriodValidator(
    orderStorage,
  );

  const orderStorageGetStub = sinon.stub(orderStorage, "get").callsFake(() => {
    return new Promise((resolve, reject) => {});
  });

  describe("#validate", () => {
    it("should reject if period is not found in branchPaymentInfo", () => {
      const branchPaymentInfo: any = {
        rentPeriods: [{ type: "year" }],
      };

      const orderItem: any = {
        type: "rent",
        info: {
          periodType: "semester",
        },
      };

      return expect(
        orderItemRentPeriodValidator.validate(
          orderItem,
          branchPaymentInfo,
          100,
        ),
      ).to.be.rejectedWith(
        BlError,
        /rent period "semester" is not valid on branch/,
      );
    });

    context("when branch is responsible", () => {
      let branchPaymentInfo: any;

      beforeEach(() => {
        branchPaymentInfo = {
          responsible: true,
        };
      });

      it("should reject if not all amounts is equal to 0 on orderItem", () => {
        const orderItem: any = {
          type: "rent",
          amount: 100,
          taxAmount: 20,
          unitPrice: 80,
        };

        return expect(
          orderItemRentPeriodValidator.validate(
            orderItem,
            branchPaymentInfo,
            100,
          ),
        ).to.be.rejectedWith(
          BlError,
          /amounts where set on orderItem when branch is responsible/,
        );
      });

      it("should resolve with true if all amounts is 0", () => {
        const orderItem: any = {
          type: "rent",
          amount: 0,
          taxAmount: 0,
          unitPrice: 0,
        };

        return expect(
          orderItemRentPeriodValidator.validate(
            orderItem,
            branchPaymentInfo,
            100,
          ),
        ).to.be.fulfilled;
      });
    });

    context("when orderItem is moved from another order", () => {
      const branchPaymentInfo: any = {
        responsible: false,
        rentPeriods: [
          {
            type: "semester",
          },
        ],
      };

      const orderItem: any = {
        type: "rent",
        item: "itemA",
        amount: 0,
        unitPrice: 0,
        taxAmount: 0,
        taxRate: 0,
        info: {
          to: new Date(),
          from: new Date(),
          numberOfPeriods: 1,
          periodType: "semester",
        },
        movedFromOrder: "orderB",
      };

      const orderB: any = {
        id: "orderB",
        amount: 200,
        orderItems: [
          {
            type: "rent",
            item: "itemA",
            amount: 100,
            unitPrice: 100,
            taxAmount: 0,
            taxRate: 0,
            info: {
              to: new Date(),
              from: new Date(),
              numberOfPeriods: 1,
              periodType: "semester",
            },
          },
        ],
        payments: ["paymentA"],
        placed: true,
      };
      //important to remember, if payments is set and placed is true, that means that the payments are also confirmed

      it("should reject if orderItem.amount is 0 but the movedFromOrder has not been payed for", (done) => {
        orderB.payments = []; // this means no payment is provided, aka customer has not payed
        orderStorageGetStub.withArgs("orderB").resolves(orderB);

        orderItemRentPeriodValidator
          .validate(orderItem, branchPaymentInfo, 100)
          .then(() => {
            done(new Error("should not resolve"));
          })
          .catch((err: BlError) => {
            expect(err.getMsg()).to.contain(
              'the original order has not been payed, but current orderItem.amount is "0"',
            );
            expect(orderStorageGetStub).to.have.been.called;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should reject if period is the same but orderItem.amount is not 0", (done) => {
        orderB.payments = ["payment1"]; // this means that the order is payed for
        orderStorageGetStub.withArgs("orderB").resolves(orderB);

        orderB.orderItems[0].type = "rent";
        orderB.orderItems[0].info.periodType = "semester";

        orderItem.amount = 100;
        orderItem.type = "rent";
        orderItem.info.periodType = "semester";

        orderItemRentPeriodValidator
          .validate(orderItem, branchPaymentInfo, 100)
          .then(() => {
            done(new Error("should not resolve"));
          })
          .catch((err: BlError) => {
            expect(err.getMsg()).to.contain(
              'the original order has been payed, but current orderItem.amount is "100"',
            );
            expect(orderStorageGetStub).to.have.been.called;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      context(
        "when new orderItem has a different period type than the original orderItem",
        () => {
          it("should reject if orderItem.amount is not equal to rentPrice - oldOrderItem.amount ", (done) => {
            branchPaymentInfo.rentPeriods.push({
              type: "year",
              date: new Date(),
              maxNumberOfPeriods: 1,
              percentage: 0.5,
            });
            orderB.payments = ["payment1"]; // this means that the order is payed for
            orderStorageGetStub.withArgs("orderB").resolves(orderB);

            orderB.orderItems[0].type = "rent";
            orderB.orderItems[0].amount = 200;
            orderB.orderItems[0].info.periodType = "semester";

            const itemPrice = 500;

            orderItem.amount = 100; // this should actually be (itemPrice 500 * percentage 0.5)- oldOrderItem 200 = 50
            orderItem.type = "rent";
            orderItem.info.periodType = "year";

            orderItemRentPeriodValidator
              .validate(orderItem, branchPaymentInfo, itemPrice)
              .then(() => {
                done(new Error("should not resolve"));
              })
              .catch((err: BlError) => {
                expect(err.getMsg()).to.contain(
                  'orderItem amount is "100" but should be "50" since the old orderItem.amount was "200"',
                );
                expect(orderStorageGetStub).to.have.been.called;
                done();
              })
              .catch((err) => {
                done(err);
              });
          });

          it("should reject if orderItem.amount is not equal to rentPrice 500 - oldOrderItem.amount 750 = -250", (done) => {
            branchPaymentInfo.rentPeriods = [
              {
                type: "semester",
                date: new Date(),
                maxNumberOfPeriods: 1,
                percentage: 0.5,
              },
            ];
            orderB.payments = ["payment1"]; // this means that the order is payed for
            orderStorageGetStub.withArgs("orderB").resolves(orderB);

            orderB.orderItems[0].type = "rent";
            orderB.orderItems[0].amount = 750;
            orderB.orderItems[0].info.periodType = "year";

            const itemPrice = 1000;

            orderItem.amount = 0; // this should actually be (itemPrice 1000 * percentage 0.5)- oldOrderItem 750 = -250
            orderItem.type = "rent";
            orderItem.info.periodType = "semester";

            orderItemRentPeriodValidator
              .validate(orderItem, branchPaymentInfo, itemPrice)
              .then(() => {
                done(new Error("should not resolve"));
              })
              .catch((err: BlError) => {
                expect(err.getMsg()).to.contain(
                  'orderItem amount is "0" but should be "-250" since the old orderItem.amount was "750"',
                );
                expect(orderStorageGetStub).to.have.been.called;
                done();
              })
              .catch((err) => {
                done(err);
              });
          });

          it("should resolve if orderItem.amount is equal to rentPrice 500 - oldOrderItem.amount 750 = -250", () => {
            branchPaymentInfo.rentPeriods = [
              {
                type: "semester",
                date: new Date(),
                maxNumberOfPeriods: 1,
                percentage: 0.5,
              },
            ];
            orderB.payments = ["payment1"]; // this means that the order is payed for
            orderStorageGetStub.withArgs("orderB").resolves(orderB);

            orderB.orderItems[0].type = "rent";
            orderB.orderItems[0].amount = 750;
            orderB.orderItems[0].info.periodType = "year";

            const itemPrice = 1000;

            orderItem.amount = -250; // this should be (itemPrice 1000 * percentage 0.5)- oldOrderItem 750 = -250
            orderItem.type = "rent";
            orderItem.info.periodType = "semester";

            return expect(
              orderItemRentPeriodValidator.validate(
                orderItem,
                branchPaymentInfo,
                itemPrice,
              ),
            ).to.be.fulfilled;
          });
        },
      );

      it("should reject if orderItem.amount is not equalt to branchPayment percentage * itemPrice", () => {
        const branchPaymentInfo: any = {
          responsible: false,
          rentPeriods: [
            {
              type: "semester",
              date: new Date(),
              maxNumberOfPeriods: 1,
              percentage: 0.5,
            },
          ],
        };

        const itemPrice = 100;

        const orderItem: any = {
          type: "rent",
          info: {
            periodType: "semester",
          },
          amount: 0,
        };

        return expect(
          orderItemRentPeriodValidator.validate(
            orderItem,
            branchPaymentInfo,
            itemPrice,
          ),
        ).to.be.rejectedWith(
          BlError,
          /orderItem.amount "0" is not equal to itemPrice "100" \* percentage "0.5" "50"/,
        );
      });

      it("should resolve if given valid orderItem", () => {
        const branchPaymentInfo: any = {
          responsible: false,
          rentPeriods: [
            {
              type: "semester",
              date: new Date(),
              maxNumberOfPeriods: 1,
              percentage: 0.5,
            },
          ],
        };

        const itemPrice = 100;

        const orderItem: any = {
          type: "rent",
          info: {
            periodType: "semester",
          },
          amount: 50,
        };

        return expect(
          orderItemRentPeriodValidator.validate(
            orderItem,
            branchPaymentInfo,
            itemPrice,
          ),
        ).to.be.fulfilled;
      });
    });
  });
});
