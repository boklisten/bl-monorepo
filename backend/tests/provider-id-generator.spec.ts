import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import ProviderIdGenerator from "#services/auth/local/provider-id-generator";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("ProviderIdGenerator", async () => {
  test("username is empty", async () => {
    const username = "";
    // @ts-expect-error fixme: auto ignored bad test types
    ProviderIdGenerator.generate(username).should.be.rejectedWith(BlError);
  });

  test("username is undefined", async () => {
    const username = undefined;
    ProviderIdGenerator
      // @ts-expect-error fixme: auto ignored
      .generate(username)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.be.rejectedWith(BlError);
  });

  test("usename is valid", async () => {
    const username = "bill@mail.com";
    ProviderIdGenerator.generate(username)
      // @ts-expect-error fixme: auto ignored bad test types
      .should.eventually.be.fulfilled.and.be.a("string")
      .and.have.length.greaterThan(63);
  });
});
