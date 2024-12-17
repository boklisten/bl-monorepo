import "mocha";
import { OrderHookBefore } from "@backend/collections/order/hooks/order-hook-before";
import { BlError } from "@shared/bl-error/bl-error";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("OrderHookBefore", () => {
  const orderHookBefore: OrderHookBefore = new OrderHookBefore();

  describe("#validate()", () => {
    context("request is not valid", () => {
      it("should reject if body is an array", (done) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const testRequest = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderHookBefore.validate(testRequest).catch((blError: BlError) => {
          expect(blError.getMsg()).to.contain(
            "request is an array but should be a object",
          );
          done();
        });
      });

      it("should reject if body does not include the minimum required fields of order like amount and orderItems", (done) => {
        const testRequest = {
          somethingRandom: ["hi", "hello there"],
        };

        orderHookBefore.validate(testRequest).catch((blError: BlError) => {
          expect(blError.getMsg()).to.contain("the request body is not valid");
          expect(blError.getCode()).to.be.eql(701);
          done();
        });
      });
    });

    context("request is valid", () => {
      it("should resolve if the request have the minimum required fields of Order", (done) => {
        const testRequest = {
          id: "order1",
          amount: 450,
          orderItems: [
            {
              type: "buy",
              amount: 300,
              item: "i1",
              title: "signatur",
              rentRate: 0,
              taxRate: 0,
              taxAmount: 0,
              unitPrice: 300,
            },
            {
              type: "rent",
              amount: 150,
              item: "i2",
              customerItem: "ci2",
              title: "signatur",
              rentRate: 0,
              taxRate: 0,
              taxAmount: 0,
              unitPrice: 300,
              rentInfo: {
                oneSemester: true,
                twoSemesters: false,
              },
            },
          ],
          delivery: "delivery1",
          branch: "b1",
          byCustomer: true,
          payments: ["payment1"],
          comments: [],
          active: false,
          user: {
            id: "u1",
          },
          lastUpdated: new Date(),
          creationTime: new Date(),
        };

        orderHookBefore.validate(testRequest).then((valid) => {
          expect(valid).to.be.true;
          done();
        });
      });
    });
  });
});
