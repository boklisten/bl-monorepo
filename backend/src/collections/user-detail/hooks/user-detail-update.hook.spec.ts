import "mocha";
import { AccessToken } from "@boklisten/bl-model";
import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";

import {
  UserDetailUpdateHook,
  UserDetailPatch,
} from "@/collections/user-detail/hooks/user-detail-update.hook";

chai.use(chaiAsPromised);

const customerAccessToken = { permission: "customer" } as AccessToken;
const adminAccessToken = { permission: "admin" } as AccessToken;

describe("UserDetailUpdateHook", () => {
  const userDetailUpdateHook = new UserDetailUpdateHook();

  it("should do proper capitalization with latin letters", async () => {
    const body: UserDetailPatch = {
      name: "siri matheus berge",
      address: "portalgata 15c",
      postCity: "bartebyen",
    };
    const expected: UserDetailPatch = {
      name: "Siri Matheus Berge",
      address: "Portalgata 15c",
      postCity: "Bartebyen",
    };
    const result = await userDetailUpdateHook.before(body, customerAccessToken);
    assert.deepEqual(result, expected);
  });

  it("should do proper capitalization and spacing with Norwegian letters", async () => {
    const body: UserDetailPatch = {
      name: "        TOR åGE       bRingsVær       ",
      address: "øygatÆn     ",
      postCity: "æresGøta   ",
    };
    const expected: UserDetailPatch = {
      name: "Tor Åge Bringsvær",
      address: "Øygatæn",
      postCity: "Æresgøta",
    };
    const result = await userDetailUpdateHook.before(body, customerAccessToken);
    assert.deepEqual(result, expected);
  });

  it("should do proper capitalization on exotic characters", async () => {
    const body: UserDetailPatch = {
      name: "İgiorİ ßißßa",
      address: "łFEłŁlo 12ł",
      postCity: "æresGøta   ",
    };
    const expected: UserDetailPatch = {
      name: "İgiori̇ SSißßa",
      address: "Łfełłlo 12ł",
      postCity: "Æresgøta",
    };
    const result = await userDetailUpdateHook.before(body, customerAccessToken);
    assert.deepEqual(result, expected);
  });

  it("should capitalize each part of hyphenated names", async () => {
    const body: UserDetailPatch = {
      name: "john maYor-taylor",
      address: "johnson st  2",
      postCity: "æresGøta   ",
    };
    const expected: UserDetailPatch = {
      name: "John Mayor-Taylor",
      address: "Johnson St 2",
      postCity: "Æresgøta",
    };
    const result = await userDetailUpdateHook.before(body, customerAccessToken);
    assert.deepEqual(result, expected);
  });

  it("should disallow email-confirmed status change by customer", async () => {
    const body: UserDetailPatch = {
      emailConfirmed: true,
    };
    await assert.isRejected(
      userDetailUpdateHook.before(body, customerAccessToken),
    );
  });

  it("should allow email-confirmed status change by admin", async () => {
    const body: UserDetailPatch = {
      emailConfirmed: true,
    };
    const expected = {
      emailConfirmed: true,
    };
    const result = await userDetailUpdateHook.before(body, adminAccessToken);
    assert.deepEqual(result, expected);
  });

  it("should allow patch by customer", async () => {
    const body: UserDetailPatch = {
      name: "1",
      postCode: "3",
      address: "4",
      postCity: "5",
      phone: "6",
      dob: "2023-02-02",
    };
    const expected = { ...body };
    const result = await userDetailUpdateHook.before(body, customerAccessToken);
    assert.deepEqual(result, expected);
  });

  it("should error on wrongly-typed field", async () => {
    const properties: (keyof UserDetailPatch)[] = [
      "name",
      "address",
      "phone",
      "postCity",
      "postCode",
      "dob",
      "emailConfirmed",
    ];
    const invalidBodies = properties.map((property) => ({ [property]: 2 }));
    // Assert that validation fails for all wrong bodies
    await Promise.all(
      invalidBodies.map(
        (body) =>
          // Flip promise result, resolved => rejected and vice versa
          new Promise<void>((resolve, reject) => {
            userDetailUpdateHook
              .before(body, adminAccessToken)
              .then(() =>
                reject(
                  new Error(
                    `Validator accepted wrongly typed ${JSON.stringify(body)}`,
                  ),
                ),
              )
              .catch(() => resolve());
          }),
      ),
    );
  });
});
