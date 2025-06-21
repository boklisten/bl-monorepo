import { test } from "@japa/runner";

import BlCrypto from "#services/config/bl-crypto";

test.group("BlCrypto.cipher()", async () => {
  test("should reject with BlError when message is empty", async ({
    assert,
  }) => {
    assert.rejects(() => BlCrypto.cipher(""));
  });

  test("should return chipher when msg is valid", async ({ assert }) => {
    assert.doesNotReject(() => BlCrypto.cipher("hello"));
  });
});

test.group("BlCrypto.hash()", (group) => {
  let testMsg = "";
  let testSalt = "";

  group.each.setup(() => {
    testMsg = "hello";
    testSalt = "dog";
  });

  test("msg is empty", async ({ assert }) => {
    testMsg = "";
    assert.rejects(() => BlCrypto.hash(testMsg, testSalt));
  });

  test("salt is empty", async ({ assert }) => {
    testSalt = "";
    assert.rejects(() => BlCrypto.hash(testMsg, testSalt));
  });

  test("should return BlCrypto.hash when salt and password is provided", async ({
    assert,
  }) => {
    assert.doesNotReject(() => BlCrypto.hash(testMsg, testSalt));
  });

  test("should not return the same BlCrypto.hash if different salt", async ({
    assert,
  }) => {
    assert.doesNotReject(
      () =>
        new Promise((resolve, reject) => {
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
        }),
    );
  });
});
