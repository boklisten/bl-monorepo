import vine from "@vinejs/vine";

export const branchValidator = vine.compile(
  vine.object({
    name: vine.string(),
    localName: vine.string().optional(),
    parentBranch: vine.string().optional(),
    childBranches: vine.array(vine.string()).optional(),
    childLabel: vine.string().optional(),
    location: vine.object({
      region: vine.string(),
      address: vine.string().optional(),
    }),
  }),
);

export const updateBranchValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    localName: vine.string().optional(),
    parentBranch: vine.string().optional(),
    childBranches: vine.array(vine.string()).optional(),
    childLabel: vine.string().optional(),
    location: vine
      .object({
        region: vine.string().optional(),
        address: vine.string().optional(),
      })
      .optional(),
  }),
);
