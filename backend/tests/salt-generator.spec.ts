import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import SaltGenerator from "#services/auth/local/salt-generator";

chaiUse(chaiAsPromised);
should();

test.group("SaltGenerator", async () => {
  test("should return a random salt", async () => {
    SaltGenerator.generate().should.eventually.be.fulfilled;
  });
});
