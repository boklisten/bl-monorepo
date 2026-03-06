import vine from "@vinejs/vine";

export const waitingListEntryValidator = vine.create(
  vine.object({
    customerName: vine.string(),
    customerPhone: vine.string().mobile({ locale: ["nb-NO"] }),
    itemId: vine.string(),
    branchId: vine.string(),
  }),
);
