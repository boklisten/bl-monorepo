import "mocha";
import { BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { HashedPasswordGenerator } from "@/auth/local/password/hashed-password-generator";
import { SaltGenerator } from "@/auth/local/salt/salt-generator";
import { SeCrypto } from "@/crypto/se.crypto";

chai.use(chaiAsPromised);

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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (error: any) => {},
        );
      });
    });
  });
});
