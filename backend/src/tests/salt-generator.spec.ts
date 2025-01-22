import SaltGenerator from "@backend/auth/local/salt-generator.js";
import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("SaltGenerator", async () => {
  test("should return a random salt", async () => {
    SaltGenerator.generate().should.eventually.be.fulfilled;
  });
});
