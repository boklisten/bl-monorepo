import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { CustomerItemValidator } from "@backend/collections/customer-item/validators/customer-item-validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

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
