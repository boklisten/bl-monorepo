import { test } from "@japa/runner";

import CryptoService from "#services/crypto_service";

test.group("CryptoService.cipher()", async () => {
  test("should return cipher when msg is valid", async ({ assert }) => {
    assert.doesNotThrow(() => {
      CryptoService.cipher("hello");
    });
  });
});
