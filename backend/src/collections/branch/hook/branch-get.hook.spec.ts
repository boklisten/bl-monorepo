import "mocha";
import { BranchGetHook } from "@backend/collections/branch/hook/branch-get.hook";
import { AccessToken } from "@shared/token/access-token";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

describe("BranchGetHook", () => {
  const branchGetHook = new BranchGetHook();

  describe("#after", () => {
    it("should return empty branchItems array if both online and atBranch in 'isBranchItemsLive' is false", () => {
      const branch = {
        id: "branch1",
        name: "some branch",
        branchItems: ["branchItem1", "branchItem2"],
        isBranchItemsLive: {
          online: false,
          atBranch: false,
        },
      };

      const expectedResult = {
        id: "branch1",
        name: "some branch",
        branchItems: [],
        isBranchItemsLive: {
          online: false,
          atBranch: false,
        },
      };

      return expect(
        branchGetHook.after([branch], {} as AccessToken),
      ).to.eventually.be.eql([expectedResult]);
    });

    it("should return branchItems array if both 'online' and 'atBranch' is true on 'isBranchItemsLive'", () => {
      const branch = {
        id: "branch1",
        name: "some branch",
        branchItems: ["branchItem1", "branchItem2"],
        isBranchItemsLive: {
          online: true,
          atBranch: true,
        },
      };

      const expectedResult = {
        id: "branch1",
        name: "some branch",
        branchItems: ["branchItem1", "branchItem2"],
        isBranchItemsLive: {
          online: true,
          atBranch: true,
        },
      };

      return expect(
        branchGetHook.after([branch], {} as AccessToken),
      ).to.eventually.be.eql([expectedResult]);
    });

    it("should not return branchItems array if 'online' is false on 'isBranchItemsLive' and 'accessToken.permission' is customer or lower", () => {
      const branch = {
        id: "branch1",
        name: "some branch",
        branchItems: ["branchItem1", "branchItem2"],
        isBranchItemsLive: {
          online: false,
          atBranch: true,
        },
      };

      const accessToken = {
        permission: "customer",
      };

      const expectedResult = {
        id: "branch1",
        name: "some branch",
        branchItems: [],
        isBranchItemsLive: {
          online: false,
          atBranch: true,
        },
      };

      return expect(
        branchGetHook.after([branch], accessToken as AccessToken),
      ).to.eventually.be.eql([expectedResult]);
    });

    it("should return branchItems array if 'online' and 'atBranch' is false on 'isBranchItemsLive' and 'accessToken.permission' is admin or above", () => {
      const branch = {
        id: "branch1",
        name: "some branch",
        branchItems: ["branchItem1", "branchItem2"],
        isBranchItemsLive: {
          online: false,
          atBranch: false,
        },
      };

      const accessToken = {
        permission: "admin",
      };

      const expectedResult = {
        id: "branch1",
        name: "some branch",
        branchItems: ["branchItem1", "branchItem2"],
        isBranchItemsLive: {
          online: false,
          atBranch: false,
        },
      };

      return expect(
        branchGetHook.after([branch], accessToken as AccessToken),
      ).to.eventually.be.eql([expectedResult]);
    });
  });
});
