import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import Blid from "#services/auth/blid";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("Blid.createUserBlid()", async () => {
  test("should reject with a BlError when provider or providerId is empty", async () => {
    Blid.createUserBlid(
      "",
      "", // @ts-expect-error fixme: auto ignored bad test types
    ).should.be.rejectedWith(BlError);
  });

  test("should return a ciphered version", async () => {
    Blid.createUserBlid(
      "local",
      "10102", // @ts-expect-error fixme: auto ignored bad test types
    ).should.eventually.include("u#");
  });
});
