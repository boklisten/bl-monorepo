import vine from "@vinejs/vine";

import { sendGridTemplateIdValidator } from "#validators/send_grid_template_id_validator";

export const reminderValidator = vine.compile(
  vine.object({
    deadlineISO: vine.string(),
    customerItemType: vine.enum(["partly-payment", "rent", "loan"]),
    branchIDs: vine.array(vine.string()),
    emailTemplateId: sendGridTemplateIdValidator.nullable(),
    smsText: vine.string().nullable(),
  }),
);
