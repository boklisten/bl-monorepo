import "mocha";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("SaltGenerator", () => {
  const saltGenerator = new SaltGenerator();

  describe("generate()", () => {
    it("should return a random salt", () => {
      return saltGenerator.generate().should.eventually.be.fulfilled;
    });
  });
});
