import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import RefreshTokenCreator from "#services/auth/token/refresh/refresh-token.creator";

chaiUse(chaiAsPromised);
should();

test.group("RefreshTokenCreator", (group) => {
  let testUserid = "";

  group.each.setup(() => {
    testUserid = "abc1";
  });

  test("username is undefined", async () => {
    const username = undefined;
    RefreshTokenCreator
      // @ts-expect-error fixme: auto ignored
      .create(username, testUserid)
      .catch((blError: BlError) => {
        blError.getCode().should.be.eq(103);
      });
  });

  test("userid is null", async () => {
    const userid = null;
    RefreshTokenCreator

      // @ts-expect-error fixme: auto ignored
      .create(testUserid, userid)
      .catch((blError: BlError) => {
        blError.getCode().should.be.eq(103);
      });
  });

  test("username is bill@meathome.se and userid is valid", async () => {
    const username = "bill@meathome.se";
    RefreshTokenCreator.create(username, testUserid).then((refreshToken) => {
      refreshToken.should.be.a("string").and.have.length.gte(50);
    });
  });
});
