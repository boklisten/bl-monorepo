import "mocha";
import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator.js";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator.js";
import { SeCrypto } from "@backend/crypto/se.crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("HashedPasswordGenerator", () => {
  const saltGenerator = new SaltGenerator();
  const seCrypto = new SeCrypto();
  const hashedPasswordGenerator = new HashedPasswordGenerator(
    saltGenerator,
    seCrypto,
  );

  describe("generate()", () => {
    describe("should reject with BlError when", () => {
      it("password is empty", () => {
        const password = "";
        return hashedPasswordGenerator
          .generate(password)
          .should.be.rejectedWith(BlError);
      });
    });

    describe("should return a object with", () => {
      const password = "thisPasswordIsValid";

      it("a property hashedPassword of type string", () => {
        return hashedPasswordGenerator.generate(password).then(
          (hashedPasswordAndSalt: { hashedPassword: string; salt: string }) => {
            hashedPasswordAndSalt.should.have
              .property("hashedPassword")
              .and.be.a("string");

            hashedPasswordAndSalt.should.have
              .property("salt")
              .and.be.a("string");
          },
          (error: any) => {},
        );
      });
    });
  });
});
