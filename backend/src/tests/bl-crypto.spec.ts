import "mocha";
import BlCrypto from "@backend/crypto/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("Crypto", () => {
  describe("BlCrypto.cipher()", () => {
    it("should reject with BlError when message is empty", () => {
      return BlCrypto.cipher("").should.be.rejectedWith(BlError);
    });

    it("should return chipher when msg is valid", () => {
      return BlCrypto.cipher("hello").should.be.fulfilled;
    });
  });

  describe("BlCrypto.hash()", () => {
    let testMsg = "";
    let testSalt = "";

    beforeEach(() => {
      testMsg = "hello";
      testSalt = "dog";
    });

    describe("should reject with BlError when", () => {
      it("msg is empty", () => {
        testMsg = "";
        return BlCrypto.hash(testMsg, testSalt).should.be.rejectedWith(BlError);
      });

      it("salt is empty", () => {
        testSalt = "";
        return BlCrypto.hash(testMsg, testSalt).should.be.rejectedWith(BlError);
      });
    });

    it("should return BlCrypto.hash when salt and password is provided", () => {
      return BlCrypto.hash(testMsg, testSalt).should.eventually.be.fulfilled;
    });

    it("should not return the same BlCrypto.hash if different salt", () => {
      return new Promise((resolve, reject) => {
        BlCrypto.hash(testMsg, "dog").then(
          (hashedPassword) => {
            BlCrypto.hash(testMsg, "dot").then(
              (anotherhashedPassword) => {
                if (anotherhashedPassword !== hashedPassword) resolve(true);
                reject(true);
              },
              (error) => {
                reject(error);
              },
            );
          },
          (error) => {
            reject(error);
          },
        );
      }).should.eventually.be.fulfilled;
    });
  });
});
