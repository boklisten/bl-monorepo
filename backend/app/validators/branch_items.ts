import vine from "@vinejs/vine";

export const branchItemsValidator = vine.compile(
  vine.object({
    branchId: vine.string(),
    branchItems: vine.array(
      vine.object({
        item: vine.object({
          id: vine.string(),
        }),
        rent: vine.boolean(),
        rentAtBranch: vine.boolean(),
        partlyPayment: vine.boolean(),
        partlyPaymentAtBranch: vine.boolean(),
        buy: vine.boolean(),
        buyAtBranch: vine.boolean(),
        subjects: vine.array(vine.string()),
      }),
    ),
  }),
);
