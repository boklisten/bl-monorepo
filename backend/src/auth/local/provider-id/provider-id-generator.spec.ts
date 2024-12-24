import "mocha";
import { ProviderIdGenerator } from "@backend/auth/local/provider-id/provider-id-generator";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { BlError } from "@shared/bl-error/bl-error";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("ProviderIdGenerator", () => {
  describe("generate()", () => {
    const seCrypto = new SeCrypto();
    const providerIdGenerator = new ProviderIdGenerator(seCrypto);

    describe("should reject with BlError when", () => {
      it("username is empty", () => {
        const username = "";
        return providerIdGenerator
          .generate(username)
          .should.be.rejectedWith(BlError);
      });

      it("username is undefined", () => {
        const username = undefined;
        return (
          providerIdGenerator
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .generate(username)
            .should.be.rejectedWith(BlError)
        );
      });
    });

    describe("should return a providerId when", () => {
      it("usename is valid", () => {
        const username = "bill@mail.com";
        return providerIdGenerator
          .generate(username)
          .should.eventually.be.fulfilled.and.be.a("string")
          .and.have.length.greaterThan(63);
      });
    });
  });
});
