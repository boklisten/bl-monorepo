import vine from "@vinejs/vine";

import { sendGridTemplateIdValidator } from "#validators/send_grid_template_id_validator";

export const emailTemplateSenderValidator = vine.compile(
  vine.object({
    emails: vine.array(vine.string()),
    emailTemplateId: sendGridTemplateIdValidator,
  }),
);
