import { HttpContext } from "@adonisjs/core/http";
import { ObjectId } from "mongodb";

import { BlSchemaName } from "#models/storage/bl-schema-names";
import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { isNullish } from "#services/legacy/typescript-helpers";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { BranchItem } from "#shared/branch-item";
import { Item } from "#shared/item";
import { UserDetail } from "#shared/user-detail";
import { branchValidator, updateBranchValidator } from "#validators/branch";
import { branchMembershipValidator } from "#validators/branch_membership";
import { subjectChoicesValidator } from "#validators/subject_choices";

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
  const childBranches = (await StorageService.Branches.aggregate([
    {
      $match: {
        _id: new ObjectId(branchId),
      },
    },
    {
      $graphLookup: {
        from: BlSchemaName.Branches,
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
    const result = await StorageService.UserDetails.updateMany(
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

type BranchItemWithRealItem = Omit<BranchItem, "item"> & { item: Item };
async function applySubjectChoices(
  branchId: string,
  subjectChoices: { phone: string; subjects: string[] }[],
) {
  const databaseQuery = new SEDbQuery();
  databaseQuery.objectIdFilters = [{ fieldName: "branch", value: branchId }];
  databaseQuery.expandFilters = [{ fieldName: "item" }];
  const branchItems = (await StorageService.BranchItems.getByQuery(
    databaseQuery,
    [{ field: "item", storage: StorageService.Items }],
  )) as unknown as BranchItemWithRealItem[];
  const knownSubjects = Array.from(
    new Set<string>(
      branchItems.flatMap((branchItem) => branchItem.categories ?? []),
    ),
  );

  const status = {
    unknownSubjects: new Set<string>(),
    unknownUsers: [] as { subjects: string[]; phone: string }[],
    successfulOrders: 0,
  };

  async function processSubjectChoice({
    phone,
    subjects,
  }: {
    phone: string;
    subjects: string[];
  }) {
    const normalizedPhone = phone.trim().slice(-8);
    const userDetailDatabaseQuery = new SEDbQuery();
    userDetailDatabaseQuery.stringFilters = [
      { fieldName: "phone", value: normalizedPhone },
    ];
    let userDetail: UserDetail;
    try {
      const [foundDetail] = await StorageService.UserDetails.getByQuery(
        userDetailDatabaseQuery,
      );
      if (isNullish(foundDetail)) {
        status.unknownUsers.push({ phone, subjects });
        return;
      }
      userDetail = foundDetail;
    } catch {
      status.unknownUsers.push({ phone, subjects });
      return;
    }

    const filteredSubjects = subjects.filter((subject) => {
      if (knownSubjects.includes(subject)) {
        return true;
      }
      status.unknownSubjects.add(subject);
      return false;
    });
    const requestedBranchItems = filteredSubjects.flatMap((subject) =>
      branchItems.filter((branchItem) =>
        branchItem.categories?.includes(subject),
      ),
    );

    await StorageService.Orders.add({
      amount: 0,
      orderItems: requestedBranchItems.map((branchItem) => ({
        type: "rent",
        item: branchItem.item.id,
        title: branchItem.item.title,
        amount: 0,
        unitPrice: 0,
        delivered: false,
        info: {
          from: new Date(),
          to: new Date("2026-07-01"), // fixme: make customizable for future use
          numberOfPeriods: 1,
          periodType: "year",
        },
      })),
      branch: branchId,
      customer: userDetail.id,
      byCustomer: true,
      placed: true,
      payments: [],
      pendingSignature: false,
    });
    status.successfulOrders++;
  }

  await Promise.allSettled(
    subjectChoices.map((subjectChoice) => processSubjectChoice(subjectChoice)),
  );

  return {
    ...status,
    unknownSubjects: [...status.unknownSubjects].sort((a, b) =>
      a.localeCompare(b),
    ),
    unknownUsers: status.unknownUsers.sort((a, b) =>
      a.phone.localeCompare(b.phone),
    ),
  };
}

export default class BranchesController {
  async add(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

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

    const branchData = await ctx.request.validateUsing(updateBranchValidator);
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
    PermissionService.adminOrFail(ctx);

    const { branchId, membershipData } = await ctx.request.validateUsing(
      branchMembershipValidator,
    );
    return await applyMembershipData(branchId, membershipData);
  }

  async uploadSubjectChoices(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const { branchId, subjectChoices } = await ctx.request.validateUsing(
      subjectChoicesValidator,
    );
    return await applySubjectChoices(branchId, subjectChoices);
  }
}
