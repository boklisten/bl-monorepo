import "mocha";
import ProviderIdGenerator from "@backend/auth/local/provider-id/provider-id-generator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("ProviderIdGenerator", () => {
  describe("generate()", () => {
    describe("should reject with BlError when", () => {
      it("username is empty", () => {
        const username = "";
        return ProviderIdGenerator.generate(username).should.be.rejectedWith(
          BlError,
        );
      });

      it("username is undefined", () => {
        const username = undefined;
        return (
          ProviderIdGenerator
            // @ts-expect-error fixme: auto ignored
            .generate(username)
            .should.be.rejectedWith(BlError)
        );
      });
    });

    describe("should return a providerId when", () => {
      it("usename is valid", () => {
        const username = "bill@mail.com";
        return ProviderIdGenerator.generate(username)
          .should.eventually.be.fulfilled.and.be.a("string")
          .and.have.length.greaterThan(63);
      });
    });
  });
});
