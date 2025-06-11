import vine from "@vinejs/vine";

export const checkPhoneNumberValidator = vine.compile(
  vine.object({
    phone: vine.string().fixedLength(8),
  }),
);
