import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { CustomerItemValidator } from "#services/collections/customer-item/validators/customer-item-validator";
import { BlError } from "#shared/bl-error/bl-error";

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
