import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { BlStorage } from "#services/storage/bl-storage";
import { branchValidator } from "#validators/branch";

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

export default class BranchesController {
  async add(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const branchData = await ctx.request.validateUsing(branchValidator);
    // @ts-expect-error fixme: exactOptionalPropertyTypes
    const newBranch = await BlStorage.Branches.add(branchData);

    return await updateBranchRelationships({
      branchId: newBranch.id,
      oldParentId: null,
      oldChildrenIds: null,
      newParentId: newBranch.parentBranch || null,
      newChildrenIds: newBranch.childBranches || null,
    });
  }

  async update(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }
    const branchData = await ctx.request.validateUsing(branchValidator);
    const branchId = ctx.params["id"];

    const storedBranch = await BlStorage.Branches.get(branchId);
    // TODO: prevent conflicts and circular structures!
    // TODO: prevent multiple branches claiming a child! aka.
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
}
