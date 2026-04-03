import vine from "@vinejs/vine";

export const editableTextsValidator = vine.create(
  vine.object({
    params: vine.object({
      id: vine.string().trim().toLowerCase().alpha({
        allowSpaces: false,
        allowDashes: false,
        allowUnderscores: true,
      }),
    }),
    text: vine.string(),
  }),
);
