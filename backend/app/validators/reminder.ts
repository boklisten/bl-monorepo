import vine from "@vinejs/vine";

const SENDGRID_TEMPLATE_ID_REGEX = /^d-\S{32}$/;

export const reminderValidator = vine.compile(
  vine.object({
    deadlineISO: vine.string(),
    customerItemType: vine.enum(["partly-payment", "rent", "loan"]),
    branchIDs: vine.array(vine.string()),
    emailTemplateId: vine.string().regex(SENDGRID_TEMPLATE_ID_REGEX).nullable(),
    smsText: vine.string().nullable(),
  }),
);
