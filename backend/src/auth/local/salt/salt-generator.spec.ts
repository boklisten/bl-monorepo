import "mocha";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("SaltGenerator", () => {
  const saltGenerator = new SaltGenerator();

  describe("generate()", () => {
    it("should return a random salt", () => {
      return saltGenerator.generate().should.eventually.be.fulfilled;
    });
  });
});
