import "mocha";
import { CustomerItemValidator } from "@backend/collections/customer-item/validators/customer-item-validator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("CustomerItemValidator", () => {
  const customerItemValidator = new CustomerItemValidator();

  let testCustomerItem: CustomerItem;

  beforeEach(() => {
    testCustomerItem = {
      id: "customerItem1",
      item: "item1",
      deadline: new Date(),
      handout: true,
      customer: "customer1",
      handoutInfo: {
        handoutBy: "branch",
        handoutById: "branch1",
        handoutEmployee: "employee1",
        time: new Date(),
      },
      returned: false,
    };
  });

  it("should reject if sent customerItem is undefined", () => {
    // @ts-expect-error fixme: auto ignored
    return expect(customerItemValidator.validate(undefined)).to.be.rejectedWith(
      BlError,
      /customerItem is undefined/,
    );
  });
});
