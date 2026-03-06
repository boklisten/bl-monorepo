import vine from "@vinejs/vine";

export const uniqueItemsValidator = vine.create(
  vine.object({
    blid: vine.string(),
    isbn: vine.string(),
  }),
);
