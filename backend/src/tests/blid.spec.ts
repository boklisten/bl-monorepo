import Blid from "@backend/auth/blid.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("Blid", () => {
  describe("createUserBlid()", () => {
    it("should reject with a BlError when provider or providerId is empty", () => {
      return Blid.createUserBlid("", "").should.be.rejectedWith(BlError);
    });

    it("should return a ciphered version", () => {
      return Blid.createUserBlid("local", "10102").should.eventually.include(
        "u#",
      );
    });
  });
});
