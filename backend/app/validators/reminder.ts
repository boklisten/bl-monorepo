import vine from "@vinejs/vine";

export const reminderValidator = vine.compile(
  vine.object({
    deadlineISO: vine.string(),
    customerItemType: vine.enum(["partly-payment", "rent", "loan"]),
    branchIDs: vine.array(vine.string()),
    emailTemplateId: vine.string().nullable(),
    smsText: vine.string().nullable(),
  }),
);
