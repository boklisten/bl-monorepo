import "mocha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { SaltGenerator } from "@/auth/local/salt/salt-generator";

chai.use(chaiAsPromised);

describe("SaltGenerator", () => {
  const saltGenerator = new SaltGenerator();

  describe("generate()", () => {
    it("should return a random salt", () => {
      return saltGenerator.generate().should.eventually.be.fulfilled;
    });
  });
});
