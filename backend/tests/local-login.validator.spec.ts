import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import LocalLoginHandler from "#services/auth/local/local-login.handler";
import LocalLoginValidator from "#services/auth/local/local-login.validator";
import UserHandler from "#services/auth/user/user.handler";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

const testLocalLogin = {
  username: "albert@protonmail.com",
  hashedPassword: "a",
  salt: "dog",
  id: "12354",
};

test.group("LocalLoginValidator", (group) => {
  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(LocalLoginHandler, "get").callsFake((username: string) => {
      return new Promise((resolve, reject) => {
        if (username === testLocalLogin.username) resolve(testLocalLogin);
        reject(new BlError("").code(702));
      });
    });

    sandbox.stub(LocalLoginHandler, "add").callsFake((localLogin) => {
      return new Promise((resolve) => {
        resolve({ id: "", ...localLogin });
      });
    });

    sandbox.stub(UserHandler, "create").callsFake((username: string) => {
      return Promise.resolve({
        id: "",
        userDetail: "",
        permission: "customer",
        blid: "",
        username: username,
      } as User);
    });

    sandbox.stub(UserHandler, "valid").callsFake(() => {
      return Promise.resolve();
    });
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject with BlError if username does exist", async () => {
    const username = testLocalLogin.username;
    const password = "something";

    LocalLoginValidator.create(username, password).then(
      (value) => {
        // @ts-expect-error fixme: auto ignored bad test types
        value.should.not.be.fulfilled;
      },
      (error: BlError) => {
        // @ts-expect-error fixme: auto ignored bad test types
        error.getMsg().should.contain("already exists");
      },
    );
  });
});
