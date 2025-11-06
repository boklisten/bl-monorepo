import vine from "@vinejs/vine";

export const branchMembershipValidator = vine.compile(
  vine.object({
    branchId: vine.string(),
    membershipData: vine.array(
      vine.object({
        branch: vine.string(),
        phone: vine.string(),
      }),
    ),
  }),
);
export const updateBranchMembershipValidator = vine.compile(
  vine.object({
    detailsId: vine.string(),
    branchMembership: vine.string().nullable(),
  }),
);
