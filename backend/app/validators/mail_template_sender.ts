import vine from "@vinejs/vine";

const SENDGRID_TEMPLATE_ID_REGEX = /^d-\S{32}$/;

export const emailTemplateSenderValidator = vine.compile(
  vine.object({
    emails: vine.array(vine.string()),
    emailTemplateId: vine.string().regex(SENDGRID_TEMPLATE_ID_REGEX),
  }),
);
