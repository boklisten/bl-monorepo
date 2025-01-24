import { CustomerItemValidator } from "@backend/lib/collections/customer-item/validators/customer-item-validator.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("CustomerItemValidator", async () => {
  const customerItemValidator = new CustomerItemValidator();
  test("should reject if sent customerItem is undefined", async () => {
    // @ts-expect-error fixme: auto ignored
    return expect(customerItemValidator.validate(undefined)).to.be.rejectedWith(
      BlError,
      /customerItem is undefined/,
    );
  });
});
