import { BranchGetHook } from "@backend/express/collections/branch/hook/branch-get.hook.js";
import { test } from "@japa/runner";
import { AccessToken } from "@shared/token/access-token.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

const branchGetHook = new BranchGetHook();

test.group("BranchGetHook.after", async () => {
  test("should return empty branchItems array if both online and atBranch in 'isBranchItemsLive' is false", async () => {
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

  test("should return branchItems array if both 'online' and 'atBranch' is true on 'isBranchItemsLive'", async () => {
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

  test("should not return branchItems array if 'online' is false on 'isBranchItemsLive' and 'accessToken.permission' is customer or lower", async () => {
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

  test("should return branchItems array if 'online' and 'atBranch' is false on 'isBranchItemsLive' and 'accessToken.permission' is admin or above", async () => {
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
