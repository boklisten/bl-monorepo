import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox } from "sinon";

import { UserDetailValidOperation } from "#services/collections/user-detail/operations/user-detail-valid.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import { UserDetail } from "#shared/user/user-detail/user-detail";

chaiUse(chaiAsPromised);
should();

test.group("UserDetailValidOperation", (group) => {
  const userDetailValidOperation = new UserDetailValidOperation();

  let testUserDetail: UserDetail;
  let sandbox: sinon.SinonSandbox;

  group.each.setup(() => {
    sandbox = createSandbox();
    sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError(`userDetail "${id}" not found`));
      }

      return Promise.resolve(testUserDetail);
    });

    testUserDetail = {
      id: "userDetail1",
      name: "Freddy Mercury",
      email: "freddy@blapi.co",
      phone: "12345678",
      address: "Star road 1",
      postCode: "0123",
      postCity: "LONDON",
      country: "ENGLAND",
      dob: new Date(1946, 9, 5),
      branch: "branch1",
      emailConfirmed: true,
      signatures: [],
      blid: "",
      branchMembership: "branch1",
    };
  });
  group.each.teardown(() => {
    sandbox.restore();
  });

  test("should reject if userDetail is not found", async ({ assert }) => {
    testUserDetail = {
      id: "userDetail1",
    } as UserDetail;

    const blApiRequest = {
      documentId: "notFoundUserDetail",
    };
    await assert.rejects(() =>
      // @ts-expect-error fixme: auto ignored
      userDetailValidOperation.run(blApiRequest, null, null),
    );
  });

  test("should send response with {valid: true}", async ({ assert }) => {
    const blApiRequest = {
      documentId: "userDetail1",
    };
    const expected = new BlapiResponse([{ valid: true }]);

    const response = await userDetailValidOperation.run(
      blApiRequest,
      // @ts-expect-error fixme: auto ignored
      null,
      null,
    );
    assert.deepEqual(response, expected);
  });

  test("should resolve with valid false if name is not defined", async ({
    assert,
  }) => {
    testUserDetail.name = "";
    const blApiRequest: BlApiRequest = {
      documentId: "userDetail1",
    };

    const response = await userDetailValidOperation.run(
      blApiRequest,
      // @ts-expect-error fixme: auto ignored
      null,
      null,
    );
    assert.deepEqual(
      response,
      new BlapiResponse([{ valid: false, invalidFields: ["name"] }]),
    );
  });

  test("should resolve with valid false if address and postCode is not defined", async ({
    assert,
  }) => {
    testUserDetail.address = "";

    // @ts-expect-error fixme: auto ignored
    testUserDetail.postCode = null;
    const blApiRequest: BlApiRequest = {
      documentId: "userDetail1",
    };
    const expected = new BlapiResponse([
      { valid: false, invalidFields: ["address", "postCode"] },
    ]);

    const response = await userDetailValidOperation.run(
      blApiRequest,
      // @ts-expect-error fixme: auto ignored
      null,
      null,
    );
    assert.deepEqual(response, expected);
  });

  test("should resolve with valid false if postCity and phone is not defined", async ({
    assert,
  }) => {
    testUserDetail.postCity = "";

    // @ts-expect-error fixme: auto ignored
    testUserDetail.phone = undefined;
    const blApiRequest: BlApiRequest = {
      documentId: "userDetail1",
    };
    const expected = new BlapiResponse([
      { valid: false, invalidFields: ["postCity", "phone"] },
    ]);

    const response = await userDetailValidOperation.run(
      blApiRequest,
      // @ts-expect-error fixme: auto ignored
      null,
      null,
    );
    assert.deepEqual(response, expected);
  });

  test("should resolve with valid false if dob is not defined", async ({
    assert,
  }) => {
    // @ts-expect-error fixme: auto ignored
    testUserDetail.dob = undefined;
    const blApiRequest: BlApiRequest = {
      documentId: "userDetail1",
    };
    const expected = new BlapiResponse([
      { valid: false, invalidFields: ["dob"] },
    ]);

    const response = await userDetailValidOperation.run(
      blApiRequest,
      // @ts-expect-error fixme: auto ignored
      null,
      null,
    );
    assert.deepEqual(response, expected);
  });
});
