import vine from "@vinejs/vine";

export const waitingListCustomerValidator = vine.create(
  vine.object({
    name: vine.string(),
    phoneNumber: vine.string().mobile({ locale: ["nb-NO"] }),
    itemId: vine.string(),
    branchId: vine.string(),
  }),
);
