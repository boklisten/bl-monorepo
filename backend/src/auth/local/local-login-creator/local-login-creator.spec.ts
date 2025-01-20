import "mocha";

import { LocalLoginCreator } from "@backend/auth/local/local-login-creator/local-login-creator.js";
import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator.js";
import { ProviderIdGenerator } from "@backend/auth/local/provider-id/provider-id-generator.js";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator.js";
import { LocalLogin } from "@backend/collections/local-login/local-login.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("LocalLoginCreator", () => {
  const saltGenerator = new SaltGenerator();
  const hashedPasswordGenerator = new HashedPasswordGenerator(saltGenerator);
  const providerIdGenerator = new ProviderIdGenerator();
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
            // @ts-expect-error fixme: auto ignored
            .create(username, password)
            .should.be.rejectedWith(BlError)
        );
      });

      it("password is null", () => {
        const username = "bill@mail.com";
        const password = null;
        return (
          localLoginCreator

            // @ts-expect-error fixme: auto ignored
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
          (error: any) => {},
        );
      });
    });
  });
});
