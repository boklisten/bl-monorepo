import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { branchBaseValidator } from "#validators/branch";

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
    const oldParent = await StorageService.Branches.get(oldParentId);
    await StorageService.Branches.update(oldParentId, {
      childBranches: oldParent.childBranches?.filter(
        (childId) => childId !== branchId,
      ),
    });
  }

  // Get the new parent and add this branch as a child
  if (newParentId !== null) {
    const newParent = await StorageService.Branches.get(newParentId);
    await StorageService.Branches.update(newParentId, {
      childBranches: [...(newParent.childBranches ?? []), branchId],
    });
  }

  // For each old child, remove their parent
  if (oldChildrenIds !== null) {
    await StorageService.Branches.updateMany(
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
      await StorageService.Branches.getMany(newChildrenIds)
    )
      .map((c) => c.parentBranch ?? "")
      .filter((id) => id.length > 0);
    const previousChildParents = await StorageService.Branches.getMany(
      previousChildParentIds,
    );
    for (const previousChildParent of previousChildParents) {
      await StorageService.Branches.update(previousChildParent.id, {
        childBranches: previousChildParent.childBranches?.filter(
          (childId) => !newChildrenIds.includes(childId),
        ),
      });
    }
    // Set the children's parent references
    await StorageService.Branches.updateMany(
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

    currentId =
      (await StorageService.Branches.get(currentId)).parentBranch ?? null;
  }
}

export default class BranchBaseController {
  async add(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const branchData = await ctx.request.validateUsing(branchBaseValidator);

    try {
      await assertValidBranchUpdate(
        "new",
        branchData.parentBranch ?? null,
        branchData.childBranches ?? null,
      );
    } catch (error) {
      return ctx.response.conflict(error);
    }

    const newBranch = await StorageService.Branches.add(branchData);

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
    PermissionService.adminOrFail(ctx);

    const branchData = await ctx.request.validateUsing(branchBaseValidator);
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

    const storedBranch = await StorageService.Branches.get(branchId);
    const updatedBranch = await StorageService.Branches.update(
      ctx.params["id"],
      {
        ...branchData,
        // since parentBranch might be "" from the client, we need to convert it to null so that the database accepts the value (ObjectID or nullish)
        parentBranch: branchData.parentBranch || null,
        type: branchData.type || null,
      },
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
}
