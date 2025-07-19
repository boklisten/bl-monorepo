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
