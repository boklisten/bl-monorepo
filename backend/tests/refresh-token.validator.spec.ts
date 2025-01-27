import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import jwt from "jsonwebtoken";

import RefreshTokenCreator from "#services/auth/token/refresh/refresh-token.creator";
import RefreshTokenValidator from "#services/auth/token/refresh/refresh-token.validator";
import { APP_CONFIG } from "#services/config/application-config";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("RefreshTokenValidator", async () => {
  test("should reject with BlError when refreshToken is empty", async () => {
    const refreshToken = "";
    RefreshTokenValidator.validate(refreshToken).should.be.rejectedWith(
      BlError,
    );
  });

  test("should reject with BlError when refreshToken is not valid", async () => {
    const refreshToken = "this is not a valid token";
    RefreshTokenValidator.validate(refreshToken).then(
      // @ts-expect-error fixme: auto ignored
      (valid: boolean) => {
        valid.should.not.be.fulfilled;
      },
      (error: BlError) => {
        error.getCode().should.be.eq(909);
      },
    );
  });

  test("should reject with BlCode 909", async () => {
    jwt.sign(
      { username: "test", iat: Math.floor(Date.now() / 1000) - 10000 },
      "test",
      { expiresIn: "1s" },
      (error, refreshToken) => {
        RefreshTokenValidator.validate(refreshToken).catch(
          (rtokenError: BlError) => {
            rtokenError.getCode().should.be.eql(909);
          },
        );
      },
    );
  });

  test("should resolve with payload", async () => {
    const username = "bill@hicks.com";
    const userid = "abc";

    RefreshTokenCreator.create(username, userid).then(
      (refreshToken: string) => {
        RefreshTokenValidator.validate(refreshToken).then(
          // @ts-expect-error fixme: auto ignored
          (refreshToken: RefreshToken) => {
            refreshToken.aud.should.be.eq(APP_CONFIG.token.refresh.aud);
            refreshToken.iss.should.be.eq(APP_CONFIG.token.refresh.iss);
          },
          (error) => {
            error.should.not.be.fulfilled;
          },
        );
      },
      (error) => {
        error.should.not.be.fulfilled;
      },
    );
  });
});
