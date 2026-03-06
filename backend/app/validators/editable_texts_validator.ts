import vine from "@vinejs/vine";

export const editableTextsValidator = vine.create(
  vine.object({
    key: vine.string().trim().toLowerCase().alpha({
      allowSpaces: false,
      allowDashes: false,
      allowUnderscores: true,
    }),
    text: vine.string(),
  }),
);
