import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import AccessTokenCreator from "#services/auth/token/access-token/access-token.creator";
import RefreshTokenCreator from "#services/auth/token/refresh/refresh-token.creator";
import { BlError } from "#shared/bl-error/bl-error";
import { UserPermission } from "#shared/permission/user-permission";

chaiUse(chaiAsPromised);
should();

test.group("AccessTokenCreator", (group) => {
  let testUsername = "";
  let testUserid = "";
  let testPermission: UserPermission = "customer";
  let testRefreshToken = "";
  let testUserDetailId = "";

  group.each.setup(async () => {
    testUsername = "bill@clintonlol.com";
    testUserid = "124";
    testPermission = "customer";
    testUserDetailId = "avx";
    testRefreshToken = await RefreshTokenCreator.create(
      testUsername,
      testUserid,
    );
  });

  test("should reject with BlError when username is undefined", async () => {
    const username = undefined;
    AccessTokenCreator.create(
      // @ts-expect-error fixme: auto ignored
      username,
      testUserid,
      testPermission,
      testUserDetailId,
      testRefreshToken,
    ).should.be.rejectedWith(BlError);
  });

  test("should reject with BlError when username is empty", async () => {
    const username = "";
    AccessTokenCreator.create(
      username,
      testUserid,
      testPermission,
      testUserDetailId,
      testRefreshToken,
    ).should.be.rejectedWith(BlError);
  });

  test("should reject with BlError when userId is undefined", async () => {
    const userid = undefined;
    AccessTokenCreator.create(
      testUsername,
      // @ts-expect-error fixme: auto ignored
      userid,
      testPermission,
      testUserDetailId,
      testRefreshToken,
    ).should.be.rejectedWith(BlError);
  });

  test("should should reject with BlError when requestToken is undefined", async () => {
    const refreshToken = "";
    AccessTokenCreator.create(
      testUsername,
      testUserid,
      testPermission,
      testUserDetailId,
      refreshToken,
    ).should.be.rejectedWith(BlError);
  });

  test("should reject with BlError code 905 when refreshToken is not valid", async () => {
    const refreshToken = "this is not valid";
    AccessTokenCreator.create(
      testUsername,
      testUserid,
      testPermission,
      testUserDetailId,
      refreshToken,
    ).then(
      (accessToken: string) => {
        accessToken.should.not.be.fulfilled;
      },
      (error: BlError) => {
        error.getCode().should.be.eq(905);
      },
    );
  });

  test("should resolve with a accessToken when all parameters is valid", async () => {
    AccessTokenCreator.create(
      testUsername,
      testUserid,
      testPermission,
      testUserDetailId,
      testRefreshToken,
    ).then(
      (accessToken: string) => {
        accessToken.should.be.a("string");
      },
      (error: BlError) => {
        error.should.not.be.fulfilled;
      },
    );
  });
});
