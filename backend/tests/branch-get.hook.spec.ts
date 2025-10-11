import { test } from "@japa/runner";

import { BranchGetHook } from "#services/legacy/collections/branch/hook/branch-get.hook";
import { AccessToken } from "#shared/access-token";

const branchGetHook = new BranchGetHook();

test.group("BranchGetHook.after", async () => {
  test("should return empty branchItems array if both online and atBranch in 'isBranchItemsLive' is false", async ({
    assert,
  }) => {
    const branch = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: ["branchItem1", "branchItem2"],
      isBranchItemsLive: {
        online: false,
        atBranch: false,
      },
      location: {
        region: "unknown",
      },
    };

    const expectedResult = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: [],
      isBranchItemsLive: {
        online: false,
        atBranch: false,
      },
      location: {
        region: "unknown",
      },
    };

    assert.deepEqual(await branchGetHook.after([branch], {} as AccessToken), [
      expectedResult,
    ]);
  });

  test("should return branchItems array if both 'online' and 'atBranch' is true on 'isBranchItemsLive'", async ({
    assert,
  }) => {
    const branch = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: ["branchItem1", "branchItem2"],
      isBranchItemsLive: {
        online: true,
        atBranch: true,
      },
      location: {
        region: "unknown",
      },
    };

    const expectedResult = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: ["branchItem1", "branchItem2"],
      isBranchItemsLive: {
        online: true,
        atBranch: true,
      },
      location: {
        region: "unknown",
      },
    };

    assert.deepEqual(await branchGetHook.after([branch], {} as AccessToken), [
      expectedResult,
    ]);
  });

  test("should not return branchItems array if 'online' is false on 'isBranchItemsLive' and 'accessToken.permission' is customer or lower", async ({
    assert,
  }) => {
    const branch = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: ["branchItem1", "branchItem2"],
      isBranchItemsLive: {
        online: false,
        atBranch: true,
      },
      location: {
        region: "unknown",
      },
    };

    const accessToken = {
      permission: "customer",
    };

    const expectedResult = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: [],
      isBranchItemsLive: {
        online: false,
        atBranch: true,
      },
      location: {
        region: "unknown",
      },
    };

    assert.deepEqual(
      await branchGetHook.after([branch], accessToken as AccessToken),
      [expectedResult],
    );
  });

  test("should return branchItems array if 'online' and 'atBranch' is false on 'isBranchItemsLive' and 'accessToken.permission' is admin or above", async ({
    assert,
  }) => {
    const branch = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: ["branchItem1", "branchItem2"],
      isBranchItemsLive: {
        online: false,
        atBranch: false,
      },
      location: {
        region: "unknown",
      },
    };

    const accessToken = {
      permission: "admin",
    };

    const expectedResult = {
      id: "branch1",
      name: "some branch",
      type: "privatist",
      branchItems: ["branchItem1", "branchItem2"],
      isBranchItemsLive: {
        online: false,
        atBranch: false,
      },
      location: {
        region: "unknown",
      },
    };

    assert.deepEqual(
      await branchGetHook.after([branch], accessToken as AccessToken),
      [expectedResult],
    );
  });
});
