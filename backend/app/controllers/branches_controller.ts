import { HttpContext } from "@adonisjs/core/http";
import { ObjectId } from "mongodb";

import { BranchModel } from "#models/branch.model";
import { PermissionService } from "#services/auth/permission.service";
import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { BlStorage } from "#services/storage/bl-storage";
import { branchValidator } from "#validators/branch";
import { branchMembershipValidator } from "#validators/branch_membership";

async function canAccess(ctx: HttpContext) {
  try {
    const accessToken = await CollectionEndpointAuth.authenticate(
      { permission: "admin" },
      ctx,
    );
    return !!(
      accessToken &&
      PermissionService.isPermissionEqualOrOver(
        accessToken?.permission,
        "admin",
      )
    );
  } catch {
    return false;
  }
}

// Updates the relationship references in other branch entities
async function updateBranchRelationships({
  branchId,
  oldParentId,
  newParentId,
  oldChildrenIds,
  newChildrenIds,
}: {
  branchId: string;
  oldParentId: string | null;
  oldChildrenIds: string[] | null;
  newParentId: string | null;
  newChildrenIds: string[] | null;
}) {
  // Get the old parent and remove this branch as a child
  if (oldParentId !== null) {
    const oldParent = await BlStorage.Branches.get(oldParentId);
    await BlStorage.Branches.update(oldParentId, {
      childBranches: oldParent.childBranches?.filter(
        (childId) => childId !== branchId,
      ),
    });
  }

  // Get the new parent and add this branch as a child
  if (newParentId !== null) {
    const newParent = await BlStorage.Branches.get(newParentId);
    await BlStorage.Branches.update(newParentId, {
      childBranches: [...(newParent.childBranches ?? []), branchId],
    });
  }

  // For each old child, remove their parent
  if (oldChildrenIds !== null) {
    await BlStorage.Branches.updateMany(
      {
        _id: { $in: oldChildrenIds },
      },
      { parentBranch: null },
    );
  }

  // For each new child, add this branch as a parent
  if (newChildrenIds !== null) {
    // Remove the previous parent's childBranch reference for all new children
    const previousChildParentIds = (
      await BlStorage.Branches.getMany(newChildrenIds)
    )
      .map((c) => c.parentBranch ?? "")
      .filter((id) => id.length > 0);
    const previousChildParents = await BlStorage.Branches.getMany(
      previousChildParentIds,
    );
    for (const previousChildParent of previousChildParents) {
      await BlStorage.Branches.update(previousChildParent.id, {
        childBranches: previousChildParent.childBranches?.filter(
          (childId) => !newChildrenIds.includes(childId),
        ),
      });
    }
    // Set the children's parent references
    await BlStorage.Branches.updateMany(
      {
        _id: { $in: newChildrenIds },
      },
      { parentBranch: branchId },
    );
  }
}

async function assertValidBranchUpdate(
  branchId: string,
  newParentId: string | null,
  newChildrenIds: string[] | null,
) {
  if (branchId === newParentId || newChildrenIds?.includes(branchId)) {
    throw new Error(`Cycle detected at branch ${branchId}`);
  }
  const visited = new Set([...(newChildrenIds ?? []), branchId]);

  let currentId: string | null = newParentId;
  while (currentId) {
    if (visited.has(currentId)) {
      throw new Error(`Cycle detected at branch ${currentId}`);
    }
    visited.add(currentId);

    currentId = (await BlStorage.Branches.get(currentId)).parentBranch ?? null;
  }
}

function findBranch(branch: string, branches: { id: string; name: string }[]) {
  return branches.find((candidate) =>
    candidate.name
      .replaceAll(" ", "")
      .toLowerCase()
      .includes(branch.replaceAll(" ", "").toLowerCase()),
  );
}

async function applyMembershipData(
  branchId: string,
  membershipData: { branch: string; phone: string }[],
) {
  const childBranches = (await BlStorage.Branches.aggregate([
    {
      $match: {
        _id: new ObjectId(branchId),
      },
    },
    {
      $graphLookup: {
        from: BranchModel.name,
        startWith: new ObjectId(branchId),
        connectFromField: "childBranches",
        connectToField: "_id",
        as: "childBranches",
      },
    },
    { $unwind: "$childBranches" },
    {
      $match: {
        "childBranches.childBranches": { $eq: [] },
      },
    },
    {
      $project: {
        _id: "$childBranches._id",
        name: "$childBranches.name",
      },
    },
  ])) as { id: string; name: string }[];

  const status = {
    unknownBranches: new Set<string>(),
    unknownRecords: [] as { phone: string; branch: string }[],
    matchedUsers: 0,
  };

  async function processMembership(membership: {
    branch: string;
    phone: string;
  }) {
    const normalizedPhone = membership.phone.trim().slice(-8);
    const branch = findBranch(membership.branch, childBranches);
    if (!branch) {
      status.unknownBranches.add(membership.branch);
      return;
    }
    const result = await BlStorage.UserDetails.updateMany(
      { phone: normalizedPhone },
      {
        branchMembership: branch.id,
      },
    );
    if (result.matchedCount === 0) {
      status.unknownRecords.push(membership);
    }
    status.matchedUsers += result.matchedCount;
  }

  await Promise.allSettled(
    membershipData.map((membership) => processMembership(membership)),
  );

  return {
    ...status,
    unknownBranches: [...status.unknownBranches].sort((a, b) =>
      a.localeCompare(b),
    ),
    unknownRecords: status.unknownRecords.sort((a, b) =>
      a.branch.localeCompare(b.branch),
    ),
  };
}

export default class BranchesController {
  async add(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const branchData = await ctx.request.validateUsing(branchValidator);

    try {
      await assertValidBranchUpdate(
        "new",
        branchData.parentBranch ?? null,
        branchData.childBranches ?? null,
      );
    } catch (error) {
      return ctx.response.conflict(error);
    }

    // @ts-expect-error fixme: exactOptionalPropertyTypes
    const newBranch = await BlStorage.Branches.add(branchData);

    await updateBranchRelationships({
      branchId: newBranch.id,
      oldParentId: null,
      oldChildrenIds: null,
      newParentId: newBranch.parentBranch || null,
      newChildrenIds: newBranch.childBranches || null,
    });

    return newBranch;
  }

  async update(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const branchData = await ctx.request.validateUsing(branchValidator);
    const branchId = ctx.params["id"];

    try {
      await assertValidBranchUpdate(
        branchId,
        branchData.parentBranch ?? null,
        branchData.childBranches ?? null,
      );
    } catch (error) {
      return ctx.response.conflict(error);
    }

    const storedBranch = await BlStorage.Branches.get(branchId);
    const updatedBranch = await BlStorage.Branches.update(
      ctx.params["id"],
      // @ts-expect-error fixme: exactOptionalPropertyTypes
      { ...branchData, parentBranch: branchData.parentBranch || null }, // since parentBranch might be "" from the client, we need to convert it to null so that the database accepts the value (ObjectID or nullish)
    );

    await updateBranchRelationships({
      branchId: updatedBranch.id,
      oldParentId: storedBranch.parentBranch || null,
      oldChildrenIds: storedBranch.childBranches || null,
      newParentId: updatedBranch.parentBranch || null,
      newChildrenIds: updatedBranch.childBranches || null,
    });

    return updatedBranch;
  }

  async uploadMemberships(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const { branchId, membershipData } = await ctx.request.validateUsing(
      branchMembershipValidator,
    );
    return await applyMembershipData(branchId, membershipData);
  }
}
