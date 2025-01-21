import "mocha";
import SaltGenerator from "@backend/auth/local/salt-generator.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("SaltGenerator", () => {
  describe("generate()", () => {
    it("should return a random salt", () => {
      return SaltGenerator.generate().should.eventually.be.fulfilled;
    });
  });
});
