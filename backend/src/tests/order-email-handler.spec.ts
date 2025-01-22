import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("OrderEmailHandler", () => {
  /* fixme: implement after updated email config is set up
  let testCustomerDetail: UserDetail;
  let testOrder: Order;
  let testPayment: Payment;
  let testDelivery: Delivery;
  let emailSendSuccessful: boolean;
  const standardTimeFormat = "DD.MM.YYYY HH.mm.ss";
  const standardDayFormat = "DD.MM.YY";
  const emailHandler = new EmailHandler({ sendgrid: { apiKey: "someKey" } });
  const orderEmailHandler = new OrderEmailHandler(emailHandler);

  let branchStorageGetStub: sinon.SinonStub;
  let paymentStorageStub: sinon.SinonStub;
  let sendOrderReceiptStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  group.each.setup(async () => {
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
    sandbox = createSandbox();
    sandbox.stub(BlStorage.Deliveries, "get").callsFake(async (id) => {
      if (id !== testDelivery.id) {
        throw new BlError("delivery not found");
      }

      return testDelivery;
    });

    branchStorageGetStub = sandbox
      .stub(BlStorage.Branches, "get")
      .resolves({ paymentInfo: { responsible: false } } as Branch);

    paymentStorageStub = sandbox
      .stub(BlStorage.Payments, "get")
      .callsFake(async (id) => {
        if (id !== testPayment.id) {
          throw new BlError("payment not found");
        }

        return testPayment;
      });

    sendOrderReceiptStub = sandbox
      .stub(emailHandler, "sendOrderReceipt")
      .callsFake(async () => {
        if (!emailSendSuccessful) {
          throw new Error("could not send email");
        }

        return {} as EmailLog;
      });
  });
  group.each.teardown(async () => {
    sandbox.restore();
  });

  test("should reject if emailHandler.sendOrderReceipt rejects", async () => {
    emailSendSuccessful = false;

    return expect(
      orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder),
    ).to.be.rejectedWith(Error, /Unable to send order receipt email/);
  });

  test("should resolve with EmailLog if emailHandler.sendWithAgreement resolves", async () => {
    return expect(
      orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder),
    ).to.be.fulfilled;
  });

  test("should set withAgreement to true when user dob is ...", async () => {
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

    // @ts-expect-error fixme: auto ignored
    testOrder.amount = testOrder.orderItems[0].amount;
    testOrder.branch = "branchThatIsResponsible";
    const ages = [
      moment(new Date()).subtract(16, "year").toDate(),
      moment(new Date()).subtract(1, "day").toDate(),
      moment(new Date()).subtract(12, "year").toDate(),
      moment(new Date()).subtract(18, "year").add(1, "day").toDate(),
    ];
    for (const age of ages) {
      testCustomerDetail.dob = age;

      await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
      const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
      const withAgreement = sendOrderReceiptArguments[3];

      expect(withAgreement).to.be.true;
    }
  });

  test("should set withAgreement to true when branch.responsible is set to true", async () => {
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

    // @ts-expect-error fixme: auto ignored
    testOrder.amount = testOrder.orderItems[0].amount;
    testOrder.branch = "branchThatIsResponsible";
    branchStorageGetStub
      .withArgs(testOrder.branch)
      .resolves({ paymentInfo: { responsible: true } } as Branch);

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const withAgreement = sendOrderReceiptArguments[3];

    expect(withAgreement).to.be.true;
  });

  test("should not have withAgreement set to true even if user is under age of 18", async () => {
    testOrder.orderItems = [
      {
        title: "Some cool title",
        amount: 100,
        type: "buy",
      } as OrderItem,
    ];

    // @ts-expect-error fixme: auto ignored
    testOrder.amount = testOrder.orderItems[0].amount;
    testCustomerDetail.dob = moment(new Date()).subtract(12, "year").toDate();

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const withAgreement = sendOrderReceiptArguments[3];

    expect(withAgreement).to.be.false;
  });

  test("should have item amount equal to order.amount", async () => {
    const expectedAmount = "100";
    testOrder.amount = parseInt(expectedAmount);

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.itemAmount).to.be.eq(expectedAmount);
  });

  test("should have showPrice set to true when order.amount is not 0", async () => {
    const expectedAmount = "120";
    testOrder.amount = parseInt(expectedAmount);

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.showPrice).to.be.eq(true);
  });

  test("should have showDeadline set to false if none of the items has type rent or extend", async () => {
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

    testOrder.amount =
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].amount + testOrder.orderItems[1].amount;

    // @ts-expect-error fixme: auto ignored
    testOrder.delivery = null;
    testPayment.amount = testOrder.amount;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.showDeadline).to.be.false;
  });

  test("should display item.amount if order.orderItem.amount is more than 0", async () => {
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

    // @ts-expect-error fixme: auto ignored
    testOrder.amount = testOrder.orderItems[0].amount;

    // @ts-expect-error fixme: auto ignored
    testOrder.delivery = null;
    testPayment.amount = testOrder.amount;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.items[0].title).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].title,
    );

    expect(emailOrder.items[0].price).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].amount.toString(),
    );

    expect(emailOrder.items[0].deadline).to.be.eq(
      DateService.format(
        // @ts-expect-error fixme: auto ignored
        testOrder.orderItems[0].info.to,
        "Europe/Oslo",
        standardDayFormat,
      ),
    );
  });

  test("should not display item.amount if order.orderItem.amount is 0 or undefined", async () => {
    testOrder.orderItems = [
      {
        title: "Det vet da fåglarna 2",
        amount: 0,
        type: "rent",
        info: {
          to: new Date(2019, 1, 1),
        },
      } as OrderItem,

      // @ts-expect-error fixme: auto ignored
      {
        title: "Jesus Christ in da house",
        amount: null,
        type: "rent",
        info: {
          to: new Date(2019, 1, 1),
        },
      } as OrderItem,
    ];

    testOrder.amount =
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].amount + testOrder.orderItems[1].amount;

    // @ts-expect-error fixme: auto ignored
    testOrder.delivery = null;
    testPayment.amount = testOrder.amount;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.items[0].title).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].title,
    );

    expect(emailOrder.items[0].price).to.be.null;

    expect(emailOrder.items[0].deadline).to.be.eq(
      DateService.format(
        // @ts-expect-error fixme: auto ignored
        testOrder.orderItems[1].info.to,
        "Europe/Oslo",
        standardDayFormat,
      ),
    );

    expect(emailOrder.items[1].title).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[1].title,
    );

    expect(emailOrder.items[1].price).to.be.null;

    expect(emailOrder.items[1].deadline).to.be.eq(
      DateService.format(
        // @ts-expect-error fixme: auto ignored
        testOrder.orderItems[1].info.to,
        "Europe/Oslo",
        standardDayFormat,
      ),
    );
  });

  test("should only show title and status if orderItem.type is return", async () => {
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

    // @ts-expect-error fixme: auto ignored
    testOrder.amount = testOrder.orderItems[0].amount;

    // @ts-expect-error fixme: auto ignored
    testOrder.delivery = null;
    testPayment.amount = testOrder.amount;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.items[0].title).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testOrder.orderItems[0].title,
    );

    expect(emailOrder.items[0].status).to.be.eq("returnert");

    expect(emailOrder.items[0].price).to.be.null;

    expect(emailOrder.items[0].deadline).to.be.null;
  });

  test("should have not have a delivery object when order.delivery is not defined", async () => {
    const expectedAmount = "540";

    testOrder.amount = parseInt(expectedAmount);

    // @ts-expect-error fixme: auto ignored
    testOrder.delivery = undefined;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.delivery).to.be.null;
    expect(emailOrder.showDelivery).to.be.false;
    expect(emailOrder.totalAmount).to.be.eq(expectedAmount);
  });

  test('should have a delivery object when order.delivery is present and have method "bring"', async () => {
    testOrder.delivery = "delivery1";
    testDelivery.method = "bring";

    // @ts-expect-error fixme: auto ignored
    testDelivery.info["trackingNumber"] = "trackingABC";
    const expectedAmount = testOrder.amount + testDelivery.amount;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    //delivery address should be on the form:
    // Billy Bob, Trondheimsveien 10 D, 0560 OSLO

    // @ts-expect-error fixme: auto ignored
    let expectedAddress = testDelivery.info["shipmentAddress"].name;
    expectedAddress +=
      // @ts-expect-error fixme: auto ignored
      ", " + testDelivery.info["shipmentAddress"].address;
    expectedAddress +=
      // @ts-expect-error fixme: auto ignored
      ", " + testDelivery.info["shipmentAddress"].postalCode;
    expectedAddress +=
      // @ts-expect-error fixme: auto ignored
      " " + testDelivery.info["shipmentAddress"].postalCity;

    expect(emailOrder.delivery).to.be.eql({
      method: testDelivery.method,
      amount: testDelivery.amount,
      currency: "NOK",
      address: expectedAddress,

      // @ts-expect-error fixme: auto ignored
      trackingNumber: testDelivery.info["trackingNumber"],
      estimatedDeliveryDate: DateService.toPrintFormat(
        // @ts-expect-error fixme: auto ignored
        testDelivery.info["estimatedDelivery"],
        "Europe/Oslo",
      ),
    });

    expect(emailOrder.showDelivery).to.be.true;
    expect(emailOrder.totalAmount).to.be.eq(expectedAmount);
  });

  test('should not have a delivery object if delivery.method is not "bring"', async () => {
    testOrder.delivery = "delivery1";
    testDelivery.method = "branch";

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1];

    expect(emailOrder.showDelivery).to.be.false;
    expect(emailOrder.delivery).to.be.null;
  });

  test('should have a payment object when the order includes payment type "dibs"', async () => {
    testOrder.payments = [testPayment.id];
    const expectedTotal = testPayment.amount;

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1]; //second arg is the emailOrder

    expect(emailOrder.showPayment).to.be.true;
    expect(emailOrder.payment.total).to.be.eq(expectedTotal);
    expect(emailOrder.payment.currency).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testPayment.info["orderDetails"].currency,
    );
    expect(emailOrder.payment.payments[0].method).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testPayment.info["paymentDetails"]["paymentMethod"],
    );
    expect(emailOrder.payment.payments[0].amount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      (testPayment.info["orderDetails"]["amount"] / 100).toString(),
    ); // the amount is in ears when it comes from dibs
    expect(emailOrder.payment.payments[0].cardInfo).to.be.eq("***" + "0079"); // should only send the last 4 digits
    expect(emailOrder.payment.payments[0].taxAmount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testPayment.taxAmount.toString(),
    );
    expect(emailOrder.payment.payments[0].paymentId).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      testPayment.info["paymentId"],
    );
    expect(emailOrder.payment.payments[0].status).to.be.eq("bekreftet");
    expect(emailOrder.payment.payments[0].creationTime).to.be.eq(
      DateService.format(
        // @ts-expect-error fixme: auto ignored
        testPayment.creationTime,
        "Europe/Oslo",
        standardTimeFormat,
      ),
    );
  });

  test("should have a payment object that includes all the payments in order", async () => {
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
    ];
    // @ts-expect-error fixme: auto ignored
    testOrder.amount = payments[0].amount + payments[1].amount;
    // @ts-expect-error fixme: auto ignored
    testOrder.payments = [payments[0].id, payments[1].id];

    // @ts-expect-error fixme: auto ignored
    paymentStorageStub.withArgs(payments[0].id).resolves(payments[0]);

    // @ts-expect-error fixme: auto ignored
    paymentStorageStub.withArgs(payments[1].id).resolves(payments[1]);

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1]; //second arg is the emailOrder

    expect(emailOrder.payment.total).to.be.eq(testOrder.amount);
    expect(emailOrder.payment.currency).to.be.eq("NOK");
    expect(emailOrder.payment.taxAmount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[0].taxAmount + payments[1].taxAmount,
    );
    expect(emailOrder.payment.payments[0].method).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[0].method,
    );
    expect(emailOrder.payment.payments[0].amount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[0].amount.toString(),
    );
    expect(emailOrder.payment.payments[0].taxAmount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[0].taxAmount.toString(),
    );
    expect(emailOrder.payment.payments[0].paymentId).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[0].id,
    );
    expect(emailOrder.payment.payments[0].status).to.be.eq("bekreftet");
    expect(emailOrder.payment.payments[0].creationTime).to.be.eq(
      DateService.format(
        // @ts-expect-error fixme: auto ignored
        payments[0].creationTime,
        "Europe/Oslo",
        "DD.MM.YYYY HH.mm.ss",
      ),
    );
    expect(emailOrder.payment.payments[1].method).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[1].method,
    );
    expect(emailOrder.payment.payments[1].amount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[1].amount.toString(),
    );
    expect(emailOrder.payment.payments[1].taxAmount).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[1].taxAmount.toString(),
    );
    expect(emailOrder.payment.payments[1].paymentId).to.be.eq(
      // @ts-expect-error fixme: auto ignored
      payments[1].id,
    );
    expect(emailOrder.payment.payments[1].status).to.be.eq("bekreftet");
    expect(emailOrder.payment.payments[1].creationTime).to.be.eq(
      DateService.format(
        // @ts-expect-error fixme: auto ignored
        payments[1].creationTime,
        "Europe/Oslo",
        "DD.MM.YYYY HH.mm.ss",
      ),
    );
  });

  test("should have showPayment set to false when there are no payments in order", async () => {
    testOrder.payments = [];

    await orderEmailHandler.sendOrderReceipt(testCustomerDetail, testOrder);
    const sendOrderReceiptArguments = sendOrderReceiptStub.lastCall.args;
    const emailOrder = sendOrderReceiptArguments[1]; // second arg is the emailOrder

    expect(emailOrder.showPayment).to.be.false;
    expect(emailOrder.payment).to.be.null;
  });

   */
});
