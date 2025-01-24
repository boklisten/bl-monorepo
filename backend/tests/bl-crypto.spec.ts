import BlCrypto from "@backend/lib/config/bl-crypto.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("BlCrypto.cipher()", async () => {
  test("should reject with BlError when message is empty", async () => {
    BlCrypto.cipher("").should.be.rejectedWith(BlError);
  });

  test("should return chipher when msg is valid", async () => {
    BlCrypto.cipher("hello").should.be.fulfilled;
  });
});

test.group("BlCrypto.hash()", (group) => {
  let testMsg = "";
  let testSalt = "";

  group.each.setup(() => {
    testMsg = "hello";
    testSalt = "dog";
  });

  test("msg is empty", async () => {
    testMsg = "";
    BlCrypto.hash(testMsg, testSalt).should.be.rejectedWith(BlError);
  });

  test("salt is empty", async () => {
    testSalt = "";
    BlCrypto.hash(testMsg, testSalt).should.be.rejectedWith(BlError);
  });

  test("should return BlCrypto.hash when salt and password is provided", async () => {
    BlCrypto.hash(testMsg, testSalt).should.eventually.be.fulfilled;
  });

  test("should not return the same BlCrypto.hash if different salt", async () => {
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
