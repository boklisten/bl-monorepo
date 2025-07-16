import vine from "@vinejs/vine";

export const userDetailPatchValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    dob: vine.string().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    postCity: vine.string().optional(),
    postCode: vine.string().optional(),
    branchMembership: vine.string().optional(),
    emailConfirmed: vine.boolean().optional(),
    guardian: vine.any().optional(),
  }),
);
