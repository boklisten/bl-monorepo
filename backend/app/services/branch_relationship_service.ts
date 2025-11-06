import { StorageService } from "#services/storage_service";

export const BranchRelationshipService = {
  async getNestedChildBranchIds(parentId: string) {
    const result: string[] = [];
    const visited = [parentId];
    const stack = [parentId];

    while (stack.length) {
      const id = stack.pop();
      const branch = await StorageService.Branches.get(id);
      const children = branch.childBranches ?? [];

      for (const childId of children) {
        if (visited.includes(childId)) continue;
        visited.push(childId);
        result.push(childId);
        stack.push(childId);
      }
    }
    return result;
  },
  async getParentBranchIds(branchId: string) {
    const result: string[] = [];
    const visited = [branchId];
    let currentId: string | undefined = branchId;

    while (currentId) {
      const branch = await StorageService.Branches.get(currentId);
      const parentId: string | undefined = branch.parentBranch;

      if (!parentId || visited.includes(parentId)) break;

      visited.push(parentId);
      result.push(parentId);
      currentId = parentId;
    }

    return result;
  },
};
