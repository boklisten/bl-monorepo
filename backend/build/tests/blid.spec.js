import Blid from "@backend/lib/auth/blid.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
chaiUse(chaiAsPromised);
should();
test.group("Blid.createUserBlid()", async () => {
    test("should reject with a BlError when provider or providerId is empty", async () => {
        Blid.createUserBlid("", "").should.be.rejectedWith(BlError);
    });
    test("should return a ciphered version", async () => {
        Blid.createUserBlid("local", "10102").should.eventually.include("u#");
    });
});
