import vine from "@vinejs/vine";

export const localAuthValidator = vine.compile(
  vine.object({
    username: vine.string().trim().toLowerCase(),
    password: vine.string(),
  }),
);
