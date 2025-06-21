import { test } from "@japa/runner";

import Blid from "#services/auth/blid";

test.group("Blid.createUserBlid()", async () => {
  test("should reject with a BlError when provider or providerId is empty", async ({
    assert,
  }) => {
    assert.rejects(() => Blid.createUserBlid("", ""));
  });

  test("should return a ciphered version", async ({ assert }) => {
    assert.include(await Blid.createUserBlid("local", "10102"), "u#");
  });
});
