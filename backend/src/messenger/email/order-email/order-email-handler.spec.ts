import "mocha";
import { dateService } from "@backend/blc/date.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderEmailHandler } from "@backend/messenger/email/order-email/order-email-handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { EmailHandler, EmailLog } from "@boklisten/bl-email";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { Payment } from "@shared/payment/payment";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("OrderEmailHandler", () => {
  let testCustomerDetail: UserDetail;
  let testOrder: Order;
  let testPayment: Payment;
  let testDelivery: Delivery;
  let emailSendSuccessful: boolean;
  const standardTimeFormat = "DD.MM.YYYY HH.mm.ss";
  const standardDayFormat = "DD.MM.YY";
  const branchStorage = new BlDocumentStorage<Branch>(
    BlCollectionName.Branches,
  );
  const deliveryStorage = new BlDocumentStorage<Delivery>(
    BlCollectionName.Deliveries,
  );
  const paymentStorage = new BlDocumentStorage<Payment>(
    BlCollectionName.Payments,
  );
  const emailHandler = new EmailHandler({ sendgrid: { apiKey: "someKey" } });
  const orderEmailHandler = new OrderEmailHandler(
    emailHandler,
    deliveryStorage,
    paymentStorage,
    branchStorage,
  );

  sinon.stub(deliveryStorage, "get").callsFake(async (id: string) => {
    if (id !== testDelivery.id) {
      throw new BlError("delivery not found");
    }

    return testDelivery;
  });

  const branchStorageGetStub = sinon
    .stub(branchStorage, "get")
    .resolves({ paymentInfo: { responsible: false } } as Branch);

  const paymentStorageStub = sinon
    .stub(paymentStorage, "get")
    .callsFake(async (id: string) => {
      if (id !== testPayment.id) {
        throw new BlError("payment not found");
      }

      return testPayment;
    });

  const sendOrderReceiptStub = sinon
    .stub(emailHandler, "sendOrderReceipt")
    .callsFake(async () => {
      if (!emailSendSuccessful) {
        throw new Error("could not send email");
      }

      return {} as EmailLog;
    });

  describe("sendOrderReceipt()", () => {
    it("should reject if emailHandler.sendOrderReceipt rejects", () => {
      emailSendSuccessful = false;

      return expect(
        orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder),
      ).to.be.rejectedWith(Error, /Unable to send order receipt email/);
    });

    it("should resolve with EmailLog if emailHandler.sendWithAgreement resolves", () => {
      return expect(
        orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder),
      ).to.be.fulfilled;
    });

    context("emailHandler.sendOrderReceipt: emailSetting argument", () => {
      context("when one of the items have type rent", () => {
        beforeEach(() => {
          testOrder.orderItems = [
            {
              title: "Some cool title",
              amount: 100,
              type: "rent",
              info: {
                to: new Date(),
              },
            } as OrderItem,
          ];

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.amount = testOrder.orderItems[0].amount;
          testOrder.branch = "branchThatIsResponsible";
        });

        context("when user is under the age of 18", () => {
          const ages = [
            moment(new Date()).subtract(16, "year").toDate(),
            moment(new Date()).subtract(1, "day").toDate(),
            moment(new Date()).subtract(12, "year").toDate(),
            moment(new Date()).subtract(18, "year").add(1, "day").toDate(),
          ];

          for (const age of ages) {
            it(
              "should set withAgreement to true when user dob is " +
                moment(age).format("DD.MM.YY"),
              (done) => {
                testCustomerDetail.dob = age;

                orderEmailHandler
                  .sendOrderReceipt(testCustomerDetail, testOrder)
                  .then(() => {
                    const sendOrderReceiptArguments =
                      sendOrderReceiptStub.lastCall.args;
                    const withAgreement = sendOrderReceiptArguments[3];

                    expect(withAgreement).to.be.true;

                    done();
                  })
                  .catch((err) => {
                    done(err);
                  });
              },
            );
          }
        });

        it("should set withAgreement to true when branch.responsible is set to true", (done) => {
          branchStorageGetStub
            .withArgs(testOrder.branch)
            .resolves({ paymentInfo: { responsible: true } } as Branch);

          orderEmailHandler
            .sendOrderReceipt(testCustomerDetail, testOrder)
            .then(() => {
              const sendOrderReceiptArguments =
                sendOrderReceiptStub.lastCall.args;
              const withAgreement = sendOrderReceiptArguments[3];

              expect(withAgreement).to.be.true;

              done();
            })
            .catch((err) => {
              done(err);
            });
        });
      });

      context("when none of the items have type rent", () => {
        beforeEach(() => {
          testOrder.orderItems = [
            {
              title: "Some cool title",
              amount: 100,
              type: "buy",
            } as OrderItem,
          ];

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.amount = testOrder.orderItems[0].amount;
        });

        it("should not have withAgreement set to true even if user is under age of 18", (done) => {
          testCustomerDetail.dob = moment(new Date())
            .subtract(12, "year")
            .toDate();

          orderEmailHandler
            .sendOrderReceipt(testCustomerDetail, testOrder)
            .then(() => {
              const sendOrderReceiptArguments =
                sendOrderReceiptStub.lastCall.args;
              const withAgreement = sendOrderReceiptArguments[3];

              expect(withAgreement).to.be.false;

              done();
            })
            .catch((err) => {
              done(err);
            });
        });
      });
    });

    context("emailHandler.sendOrderReceipt: emailOrder argument", () => {
      it("should have item amount equal to order.amount", (done) => {
        const expectedAmount = "100";
        testOrder.amount = parseInt(expectedAmount);

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            expect(emailOrder.itemAmount).to.be.eq(expectedAmount);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should have showPrice set to true when order.amount is not 0", (done) => {
        const expectedAmount = "120";
        testOrder.amount = parseInt(expectedAmount);

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            expect(emailOrder.showPrice).to.be.eq(true);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should have showDeadline set to false if none of the items has type rent or extend", (done) => {
        testOrder.orderItems = [
          {
            title: "Det vet da fåglarna",
            amount: 100,
            type: "cancel",
          } as OrderItem,
          {
            title: "Jokko mokko",
            amount: 100,
            type: "return",
          } as OrderItem,
        ];

        testOrder.amount = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].amount + testOrder.orderItems[1].amount;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.delivery = null;
        testPayment.amount = testOrder.amount;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            expect(emailOrder.showDeadline).to.be.false;

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should display item.amount if order.orderItem.amount is more than 0", (done) => {
        testOrder.orderItems = [
          {
            title: "Det vet da fåglarna",
            amount: 100,
            type: "rent",
            info: {
              to: new Date(2019, 1, 1),
            },
          } as OrderItem,
        ];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.amount = testOrder.orderItems[0].amount;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.delivery = null;
        testPayment.amount = testOrder.amount;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].title).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testOrder.orderItems[0].title,
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].price).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testOrder.orderItems[0].amount.toString(),
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].deadline).to.be.eq(
              dateService.format(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                testOrder.orderItems[0].info.to,
                "Europe/Oslo",
                standardDayFormat,
              ),
            );

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should not display item.amount if order.orderItem.amount is 0 or undefined", (done) => {
        testOrder.orderItems = [
          {
            title: "Det vet da fåglarna 2",
            amount: 0,
            type: "rent",
            info: {
              to: new Date(2019, 1, 1),
            },
          } as OrderItem,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          {
            title: "Jesus Christ in da house",
            amount: null,
            type: "rent",
            info: {
              to: new Date(2019, 1, 1),
            },
          } as OrderItem,
        ];

        testOrder.amount = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testOrder.orderItems[0].amount + testOrder.orderItems[1].amount;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.delivery = null;
        testPayment.amount = testOrder.amount;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].title).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testOrder.orderItems[0].title,
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].price).to.be.null;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].deadline).to.be.eq(
              dateService.format(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                testOrder.orderItems[1].info.to,
                "Europe/Oslo",
                standardDayFormat,
              ),
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[1].title).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testOrder.orderItems[1].title,
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[1].price).to.be.null;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[1].deadline).to.be.eq(
              dateService.format(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                testOrder.orderItems[1].info.to,
                "Europe/Oslo",
                standardDayFormat,
              ),
            );

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should only show title and status if orderItem.type is return", (done) => {
        testOrder.orderItems = [
          {
            title: "Det vet da fåglarna 2",
            amount: 0,
            type: "return",
            info: {
              to: new Date(2019, 1, 1),
            },
          } as OrderItem,
        ];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.amount = testOrder.orderItems[0].amount;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.delivery = null;
        testPayment.amount = testOrder.amount;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].title).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testOrder.orderItems[0].title,
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].status).to.be.eq("returnert");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].price).to.be.null;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.items[0].deadline).to.be.null;

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should have not have a delivery object when order.delivery is not defined", (done) => {
        const expectedAmount = "540";

        testOrder.amount = parseInt(expectedAmount);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.delivery = undefined;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            expect(emailOrder.delivery).to.be.null;
            expect(emailOrder.showDelivery).to.be.false;
            expect(emailOrder.totalAmount).to.be.eq(expectedAmount);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it('should have a delivery object when order.delivery is present and have method "bring"', (done) => {
        testOrder.delivery = "delivery1";
        testDelivery.method = "bring";
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testDelivery.info["trackingNumber"] = "trackingABC";
        const expectedAmount = testOrder.amount + testDelivery.amount;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            //delivery address should be on the form:
            // Billy Bob, Trondheimsveien 10 D, 0560 OSLO
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            let expectedAddress = testDelivery.info["shipmentAddress"].name;
            expectedAddress +=
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ", " + testDelivery.info["shipmentAddress"].address;
            expectedAddress +=
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ", " + testDelivery.info["shipmentAddress"].postalCode;
            expectedAddress +=
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              " " + testDelivery.info["shipmentAddress"].postalCity;

            expect(emailOrder.delivery).to.be.eql({
              method: testDelivery.method,
              amount: testDelivery.amount,
              currency: "NOK",
              address: expectedAddress,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              trackingNumber: testDelivery.info["trackingNumber"],
              estimatedDeliveryDate: dateService.toPrintFormat(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                testDelivery.info["estimatedDelivery"],
                "Europe/Oslo",
              ),
            });

            expect(emailOrder.showDelivery).to.be.true;
            expect(emailOrder.totalAmount).to.be.eq(expectedAmount);

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it('should not have a delivery object if delivery.method is not "bring"', (done) => {
        testOrder.delivery = "delivery1";
        testDelivery.method = "branch";

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1];

            expect(emailOrder.showDelivery).to.be.false;
            expect(emailOrder.delivery).to.be.null;

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it('should have a payment object when the order includes payment type "dibs"', (done) => {
        testOrder.payments = [testPayment.id];
        const expectedTotal = testPayment.amount;

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1]; //second arg is the emailOrder

            expect(emailOrder.showPayment).to.be.true;
            expect(emailOrder.payment.total).to.be.eq(expectedTotal);
            expect(emailOrder.payment.currency).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testPayment.info["orderDetails"].currency,
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].method).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testPayment.info["paymentDetails"]["paymentMethod"],
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].amount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (testPayment.info["orderDetails"]["amount"] / 100).toString(),
            ); // the amount is in ears when it comes from dibs// eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].cardInfo).to.be.eq(
              "***" + "0079",
            ); // should only send the last 4 digits// eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].taxAmount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testPayment.taxAmount.toString(),
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].paymentId).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              testPayment.info["paymentId"],
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].status).to.be.eq("bekreftet"); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].creationTime).to.be.eq(
              dateService.format(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                testPayment.creationTime,
                "Europe/Oslo",
                standardTimeFormat,
              ),
            );

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should have a payment object that includes all the payments in order", (done) => {
        const payments: Payment[] = [
          {
            id: "payment2",
            method: "cash",
            order: "order1",
            amount: 100,
            customer: "customer1",
            branch: "branch1",
            taxAmount: 0,
            confirmed: true,
            creationTime: new Date(2001, 1, 1),
          },
          {
            id: "payment3",
            method: "card",
            order: "order1",
            amount: 400,
            customer: "customer1",
            branch: "branch1",
            taxAmount: 0,
            confirmed: true,
            creationTime: new Date(1900, 1, 2),
          },
        ]; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.amount = payments[0].amount + payments[1].amount; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testOrder.payments = [payments[0].id, payments[1].id];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        paymentStorageStub.withArgs(payments[0].id).resolves(payments[0]);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        paymentStorageStub.withArgs(payments[1].id).resolves(payments[1]);

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1]; //second arg is the emailOrder

            expect(emailOrder.payment.total).to.be.eq(testOrder.amount);
            expect(emailOrder.payment.currency).to.be.eq("NOK");
            expect(emailOrder.payment.taxAmount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore// eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[0].taxAmount + payments[1].taxAmount,
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].method).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[0].method,
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].amount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[0].amount.toString(),
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].taxAmount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[0].taxAmount.toString(),
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].paymentId).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[0].id,
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].status).to.be.eq("bekreftet"); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[0].creationTime).to.be.eq(
              dateService.format(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                payments[0].creationTime,
                "Europe/Oslo",
                "DD.MM.YYYY HH.mm.ss",
              ),
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[1].method).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[1].method,
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[1].amount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[1].amount.toString(),
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[1].taxAmount).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[1].taxAmount.toString(),
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[1].paymentId).to.be.eq(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              payments[1].id,
            ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[1].status).to.be.eq("bekreftet"); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(emailOrder.payment.payments[1].creationTime).to.be.eq(
              dateService.format(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                payments[1].creationTime,
                "Europe/Oslo",
                "DD.MM.YYYY HH.mm.ss",
              ),
            );

            done();
          })
          .catch((err) => {
            done(err);
          });
      });

      it("should have showPayment set to false when there are no payments in order", (done) => {
        testOrder.payments = [];

        orderEmailHandler
          .sendOrderReceipt(testCustomerDetail, testOrder)
          .then(() => {
            const sendOrderReceiptArguments =
              sendOrderReceiptStub.lastCall.args;
            const emailOrder = sendOrderReceiptArguments[1]; // second arg is the emailOrder

            expect(emailOrder.showPayment).to.be.false;
            expect(emailOrder.payment).to.be.null;

            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });

  beforeEach(() => {
    emailSendSuccessful = true;

    testCustomerDetail = {
      id: "customer1",
      email: "customer@test.com",
      dob: new Date(1993, 1, 1),
      address: "Traktorveien 10 D",
      postCity: "Trondheim",
      postCode: "7070",
      guardian: {
        email: "guardian@boklisten.co",
        name: "Guardian McGuardiface",
        phone: "12345678",
      },
    } as UserDetail;

    testDelivery = {
      id: "delivery1",
      order: "order1",
      method: "bring",
      info: {
        amount: 150,
        estimatedDelivery: new Date(),
        shipmentAddress: {
          name: "Billy Bob",
          address: "T town",
          postalCity: "Trondheim",
          postalCode: "1234",
        },
      },
      amount: 150,
      taxAmount: 0,
    };

    testPayment = {
      id: "payment1",
      method: "dibs",
      order: "order1",
      amount: 250,
      taxAmount: 0,
      customer: "customer1",
      branch: "branch1",
      creationTime: new Date(),
      info: {
        consumer: {
          privatePerson: {
            email: "aholskil@gmail.com",
            firstName: "Andreas",
            lastName: "Holskil",
            phoneNumber: {
              number: "91804211",
              prefix: "+47",
            },
          },
          shippingAddress: {
            addressLine1: "Trondheimsveien 10",
            addressLine2: "",
            city: "OSLO",
            country: "NOR",
            postalCode: "0560",
          },
        },
        created: "2018-06-27T06:53:35.2829+00:00",
        orderDetails: {
          amount: 25000,
          currency: "NOK",
          reference: "5b33346ba8d009002fbb599f",
        },
        paymentDetails: {
          cardDetails: {
            expiryDate: "0145",
            maskedPan: "492500******0079",
          },
          invoiceDetails: {},
          paymentMethod: "Visa",
          paymentType: "CARD",
        },
        paymentId: "603b1b8046064035a55d68b07426f8a8",
        summary: {
          reservedAmount: 25000,
        },
      },
    };

    testOrder = {
      id: "order1",
      creationTime: new Date(),
      amount: 100,
      delivery: "delivery1",
      branch: "branch",
      customer: "customer1",
      byCustomer: false,
      payments: ["payment1"],
      orderItems: [
        {
          type: "rent",
          item: "item1",
          info: {
            from: new Date(),
            to: new Date(),
            numberOfPeriods: 1,
            periodType: "semester",
          },
          title: "Signatur 3",
          amount: 100,
          unitPrice: 100,
          taxRate: 0,
          taxAmount: 0,
        },
      ],
      pendingSignature: false,
    };
  });
});
