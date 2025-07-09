import vine from "@vinejs/vine";

export type SendGridTemplateId = `d-${Lowercase<string>}`;
const SENDGRID_TEMPLATE_ID_REGEX = /^d-[0-9a-f]{32}$/;

export const sendGridTemplateIdValidator = vine
  .string()
  .trim()
  .toLowerCase()
  .regex(SENDGRID_TEMPLATE_ID_REGEX);

// Vine does not currently support template literals, so we need this workaround to ensure the type is correct
export function assertSendGridTemplateId(value: string): SendGridTemplateId {
  if (!SENDGRID_TEMPLATE_ID_REGEX.test(value)) {
    throw new Error(`Invalid SendGrid Template ID: “${value}”`);
  }
  return value as SendGridTemplateId;
}
