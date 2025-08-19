import vine from "@vinejs/vine";

export const uniqueItemsValidator = vine.compile(
  vine.object({
    blid: vine.string(),
    isbn: vine.string(),
  }),
);
