import LocalLoginCreator from "@backend/auth/local/local-login-creator.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("LocalLoginCreator", async () => {
  test("username is empty", async () => {
    const username = "";
    const password = "thisIsAValidPassword";
    LocalLoginCreator.create(username, password).should.be.rejectedWith(
      BlError,
    );
  });

  test("username is undefined", async () => {
    const username = undefined;
    const password = "thisisavalidpassword";
    LocalLoginCreator
      // @ts-expect-error fixme: auto ignored
      .create(username, password)
      .should.be.rejectedWith(BlError);
  });

  test("password is null", async () => {
    const username = "bill@mail.com";
    const password = null;
    LocalLoginCreator
      // @ts-expect-error fixme: auto ignored
      .create(username, password)
      .should.be.rejectedWith(BlError);
  });

  test("password is under 6 char", async () => {
    const username = "bill@gmail.com";
    const password = "abc";

    LocalLoginCreator.create(username, password).should.be.rejectedWith(
      BlError,
    );
  });
});

test("username and password is valid", async () => {
  const username = "bill@mail.com";
  const password = "thisIsAValidPassword";

  LocalLoginCreator.create(username, password).then(
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

      localLogin.should.have.property("hashedPassword").and.have.length.gte(64);
    },
  );
});
