import vine from "@vinejs/vine";

export const branchMembershipValidator = vine.compile(
  vine.object({
    membershipData: vine.array(
      vine.object({
        branch: vine.string(),
        phone: vine.string(),
      }),
    ),
  }),
);
