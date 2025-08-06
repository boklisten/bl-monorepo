import vine from "@vinejs/vine";

export const signValidator = vine.compile(
  vine.object({
    base64EncodedImage: vine.string(),
    signingName: vine.string(),
  }),
);
