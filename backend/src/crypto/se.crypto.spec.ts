import "mocha";
import { BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { SeCrypto } from "@/crypto/se.crypto";

chai.use(chaiAsPromised);
chai.should();

describe("SeCrypto", () => {
  const seCrypto: SeCrypto = new SeCrypto();

  describe("cipher()", () => {
    it("should reject with BlError when message is empty", () => {
      return seCrypto.cipher("").should.be.rejectedWith(BlError);
    });

    it("should return chipher when msg is valid", () => {
      return seCrypto.cipher("hello").should.be.fulfilled;
    });
  });

  describe("hash()", () => {
    let testMsg = "";
    let testSalt = "";

    beforeEach(() => {
      testMsg = "hello";
      testSalt = "dog";
    });

    describe("should reject with BlError when", () => {
      it("msg is empty", () => {
        testMsg = "";
        return seCrypto.hash(testMsg, testSalt).should.be.rejectedWith(BlError);
      });

      it("salt is empty", () => {
        testSalt = "";
        return seCrypto.hash(testMsg, testSalt).should.be.rejectedWith(BlError);
      });
    });

    it("should return hash when salt and password is provided", () => {
      return seCrypto.hash(testMsg, testSalt).should.eventually.be.fulfilled;
    });

    it("should not return the same hash if different salt", () => {
      return new Promise((resolve, reject) => {
        seCrypto.hash(testMsg, "dog").then(
          (hashedPassword: string) => {
            seCrypto.hash(testMsg, "dot").then(
              (anotherHashedPassword) => {
                if (anotherHashedPassword !== hashedPassword) resolve(true);
                reject(true);
              },
              (error: any) => {
                reject(error);
              },
            );
          },
          (error: any) => {
            reject(error);
          },
        );
      }).should.eventually.be.fulfilled;
    });
  });
});
