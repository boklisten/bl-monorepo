import vine from "@vinejs/vine";

export const rapidHandoutValidator = vine.create({
  blid: vine.string(),
  customerId: vine.string(),
});
