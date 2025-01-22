import ProviderIdGenerator from "@backend/auth/local/provider-id-generator.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("ProviderIdGenerator", async () => {
  test("username is empty", async () => {
    const username = "";
    ProviderIdGenerator.generate(username).should.be.rejectedWith(BlError);
  });

  test("username is undefined", async () => {
    const username = undefined;
    ProviderIdGenerator
      // @ts-expect-error fixme: auto ignored
      .generate(username)
      .should.be.rejectedWith(BlError);
  });

  test("usename is valid", async () => {
    const username = "bill@mail.com";
    ProviderIdGenerator.generate(username)
      .should.eventually.be.fulfilled.and.be.a("string")
      .and.have.length.greaterThan(63);
  });
});
