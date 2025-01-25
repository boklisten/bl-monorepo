import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import TokenHandler from "#services/auth/token/token.handler";
import UserHandler from "#services/auth/user/user.handler";

chaiUse(chaiAsPromised);
should();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testUser: any = {
  id: "abc",
  username: "bill@clintonisugly.com",
  userDetail: "abc",
  permission: "customer",
  login: {
    provider: "",
    providerId: "",
  },
  blid: "123",
  valid: true,
};

test.group("TokenHandler", (group) => {
  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(UserHandler, "getByUsername").callsFake((username: string) => {
      return new Promise((resolve, reject) => {
        if (username === testUser.username) {
          return resolve(testUser);
        }
        reject(new BlError("could not find user"));
      });
    });

    sandbox.stub(UserHandler, "valid").callsFake(() => {
      return Promise.resolve();
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject with BlError", async () => {
    const username = undefined;
    TokenHandler
      // @ts-expect-error fixme: auto ignored
      .createTokens(username)
      .should.be.rejectedWith(BlError);
  });

  test("should resolve with accessToken and refreshToken", async () => {
    TokenHandler.createTokens(testUser.username).then(
      (tokens: { accessToken: string; refreshToken: string }) => {
        tokens.accessToken.should.have.length.gte(50);
        tokens.refreshToken.should.have.length.gte(50);
      },
    );
  });
});
