import "mocha";
import { BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { Blid } from "@/auth/blid/blid";

chai.use(chaiAsPromised);

describe("Blid", () => {
  describe("createUserBlid()", () => {
    const blid: Blid = new Blid();

    it("should reject with a BlError when provider or providerId is empty", () => {
      return blid.createUserBlid("", "").should.be.rejectedWith(BlError);
    });

    it("should return a ciphered version", () => {
      return blid
        .createUserBlid("local", "10102")
        .should.eventually.include("u#");
    });
  });
});
