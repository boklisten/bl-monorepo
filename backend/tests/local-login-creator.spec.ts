import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import LocalLoginCreator from "#services/auth/local/local-login-creator";
import { LocalLogin } from "#services/types/local-login";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("LocalLoginCreator", async () => {
  test("username is empty", async () => {
    const username = "";
    const password = "thisIsAValidPassword";
    LocalLoginCreator.create(
      username,
      password, // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("username is undefined", async () => {
    const username = undefined;
    const password = "thisisavalidpassword";
    // @ts-expect-error fixme: auto ignored
    LocalLoginCreator.create(username, password)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.be.rejectedWith(BlError);
  });

  test("password is null", async () => {
    const username = "bill@mail.com";
    const password = null;
    // @ts-expect-error fixme: auto ignored
    LocalLoginCreator.create(username, password)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.be.rejectedWith(BlError);
  });

  test("password is under 6 char", async () => {
    const username = "bill@gmail.com";
    const password = "abc";

    LocalLoginCreator.create(
      username,
      password, // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });
});

test("username and password is valid", async () => {
  const username = "bill@mail.com";
  const password = "thisIsAValidPassword";

  LocalLoginCreator.create(username, password).then(
    (localLogin: LocalLogin) => {
      // @ts-expect-error fixme: auto ignored bad test types
      localLogin.should.have.property("username").and.be.eq(username);

      // @ts-expect-error fixme: auto ignored bad test types
      localLogin.should.have
        .property("salt")
        .and.have.length.greaterThan(10)
        .and.be.a("string");

      // @ts-expect-error fixme: auto ignored bad test types
      localLogin.should.have
        .property("providerId")
        .and.have.length.greaterThan(10)
        .and.be.a("string");

      // @ts-expect-error fixme: auto ignored bad test types
      localLogin.should.have.property("provider").and.be.eq("local");

      // @ts-expect-error fixme: auto ignored bad test types
      localLogin.should.have.property("hashedPassword").and.have.length.gte(64);
    },
  );
});
