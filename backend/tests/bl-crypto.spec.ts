import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import BlCrypto from "#services/config/bl-crypto";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("BlCrypto.cipher()", async () => {
  test("should reject with BlError when message is empty", async () => {
    // @ts-expect-error fixme: auto ignored bad test types
    BlCrypto.cipher("").should.be.rejectedWith(BlError);
  });

  test("should return chipher when msg is valid", async () => {
    // @ts-expect-error fixme: auto ignored bad test types
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
    BlCrypto.hash(
      testMsg,
      testSalt, // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("salt is empty", async () => {
    testSalt = "";
    BlCrypto.hash(
      testMsg,
      testSalt, // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("should return BlCrypto.hash when salt and password is provided", async () => {
    BlCrypto.hash(
      testMsg,
      testSalt, // @ts-expect-error fixme: auto ignored bad test types
    ).should.eventually.be.fulfilled;
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
      // @ts-expect-error fixme: auto ignored bad test types
    }).should.eventually.be.fulfilled;
  });
});
