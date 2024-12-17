import "mocha";
import { BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { LocalLoginCreator } from "@/auth/local/local-login-creator/local-login-creator";
import { HashedPasswordGenerator } from "@/auth/local/password/hashed-password-generator";
import { ProviderIdGenerator } from "@/auth/local/provider-id/provider-id-generator";
import { SaltGenerator } from "@/auth/local/salt/salt-generator";
import { LocalLogin } from "@/collections/local-login/local-login";
import { SeCrypto } from "@/crypto/se.crypto";

chai.use(chaiAsPromised);

describe("LocalLoginCreator", () => {
  const saltGenerator = new SaltGenerator();
  const seCrypto = new SeCrypto();
  const hashedPasswordGenerator = new HashedPasswordGenerator(
    saltGenerator,
    seCrypto,
  );
  const providerIdGenerator = new ProviderIdGenerator(seCrypto);
  const localLoginCreator = new LocalLoginCreator(
    hashedPasswordGenerator,
    providerIdGenerator,
  );

  describe("create()", () => {
    describe("should reject with BlError when", () => {
      it("username is empty", () => {
        const username = "";
        const password = "thisIsAValidPassword";
        return localLoginCreator
          .create(username, password)
          .should.be.rejectedWith(BlError);
      });

      it("username is undefined", () => {
        const username = undefined;
        const password = "thisisavalidpassword";
        return (
          localLoginCreator
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .create(username, password)
            .should.be.rejectedWith(BlError)
        );
      });

      it("password is null", () => {
        const username = "bill@mail.com";
        const password = null;
        return (
          localLoginCreator
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .create(username, password)
            .should.be.rejectedWith(BlError)
        );
      });

      it("password is under 6 char", () => {
        const username = "bill@gmail.com";
        const password = "abc";

        return localLoginCreator
          .create(username, password)
          .should.be.rejectedWith(BlError);
      });
    });

    describe("should resolve with a LocalLogin object when", () => {
      it("username and password is valid", () => {
        const username = "bill@mail.com";
        const password = "thisIsAValidPassword";

        return localLoginCreator.create(username, password).then(
          (localLogin: LocalLogin) => {
            localLogin.should.have.property("username").and.be.eq(username);

            localLogin.should.have
              .property("salt")
              .and.have.length.greaterThan(10)
              .and.be.a("string");

            localLogin.should.have
              .property("providerId")
              .and.have.length.greaterThan(10)
              .and.be.a("string");

            localLogin.should.have.property("provider").and.be.eq("local");

            localLogin.should.have
              .property("hashedPassword")
              .and.have.length.gte(64);
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (error: any) => {},
        );
      });
    });
  });
});
