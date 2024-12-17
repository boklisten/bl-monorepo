import "mocha";
import { BlError, CustomerItem } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { BlCollectionName } from "@/collections/bl-collection";
import { CustomerItemValidator } from "@/collections/customer-item/validators/customer-item-validator";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);

describe("CustomerItemValidator", () => {
  const customerItemStorage = new BlDocumentStorage<CustomerItem>(
    BlCollectionName.CustomerItems,
  );
  const customerItemValidator = new CustomerItemValidator(customerItemStorage);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return expect(customerItemValidator.validate(undefined)).to.be.rejectedWith(
      BlError,
      /customerItem is undefined/,
    );
  });
});
