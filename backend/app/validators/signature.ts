import vine from "@vinejs/vine";

export const signValidator = vine.create(
  vine.object({
    base64EncodedImage: vine.string(),
    signingName: vine.string(),
  }),
);
