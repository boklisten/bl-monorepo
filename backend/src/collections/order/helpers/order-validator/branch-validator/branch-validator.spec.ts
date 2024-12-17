import "mocha";
import { Branch, OrderItem } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { BranchValidator } from "@/collections/order/helpers/order-validator/branch-validator/branch-validator";

chai.use(chaiAsPromised);

describe("BranchValidator", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testOrderItem: OrderItem;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testBranch: Branch;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const branchValidator: BranchValidator = new BranchValidator();

  beforeEach(() => {
    testOrderItem = {
      title: "signatur 3",
      unitPrice: 200,
      taxRate: 0,
      taxAmount: 0,
      item: "i1",
      amount: 100,
      type: "rent",
    };

    testBranch = {
      id: "branch1",
      name: "Sonans",
      branchItems: [],
      paymentInfo: {
        responsible: false,
        rentPeriods: [
          {
            type: "semester",
            date: new Date(),
            maxNumberOfPeriods: 2,
            percentage: 0.5,
          },
        ],
        extendPeriods: [
          {
            type: "semester",
            price: 100,
            date: new Date(),
            maxNumberOfPeriods: 1,
          },
        ],
        buyout: {
          percentage: 0.5,
        },
        acceptedMethods: ["card"],
      },
    };
  });
});
