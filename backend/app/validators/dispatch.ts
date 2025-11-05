import vine from "@vinejs/vine";

export const sendgridEmailTemplatesResponseValidator = vine.compile(
  vine.object({
    result: vine.array(
      vine.object({
        id: vine.string(),
        name: vine.string(),
      }),
    ),
  }),
);
