import { test } from "@japa/runner";

import BlidService from "#services/blid_service";

test.group("BlidService.createUserBlid()", () => {
  test("should return a ciphered version", ({ assert }) => {
    assert.include(BlidService.createUserBlid("local", "10102"), "u#");
  });
});
