import HashedPasswordGenerator from "@backend/lib/auth/local/hashed-password-generator.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
chaiUse(chaiAsPromised);
should();
test.group("HashedPasswordGenerator", async () => {
    test("password is empty", async () => {
        const password = "";
        HashedPasswordGenerator.generate(password).should.be.rejectedWith(BlError);
    });
    test("a property hashedPassword of type string", async () => {
        const password = "thisPasswordIsValid";
        HashedPasswordGenerator.generate(password).then((hashedPasswordAndSalt) => {
            hashedPasswordAndSalt.should.have
                .property("hashedPassword")
                .and.be.a("string");
            hashedPasswordAndSalt.should.have.property("salt").and.be.a("string");
        });
    });
});
