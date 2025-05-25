import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import HashedPasswordGenerator from "#services/auth/local/hashed-password-generator";
import { BlError } from "#shared/bl-error/bl-error";

chaiUse(chaiAsPromised);
should();

test.group("HashedPasswordGenerator", async () => {
  test("password is empty", async () => {
    const password = "";
    // @ts-expect-error fixme: auto ignored bad test types
    HashedPasswordGenerator.generate(password).should.be.rejectedWith(BlError);
  });

  test("a property hashedPassword of type string", async () => {
    const password = "thisPasswordIsValid";
    HashedPasswordGenerator.generate(password).then(
      (hashedPasswordAndSalt: { hashedPassword: string; salt: string }) => {
        // @ts-expect-error fixme: auto ignored bad test types
        hashedPasswordAndSalt.should.have
          .property("hashedPassword")
          .and.be.a("string");

        // @ts-expect-error fixme: auto ignored bad test types
        hashedPasswordAndSalt.should.have.property("salt").and.be.a("string");
      },
    );
  });
});
