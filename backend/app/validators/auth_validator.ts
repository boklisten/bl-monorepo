import vine from "@vinejs/vine";

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().toLowerCase(),
  }),
);

export const passwordResetValidator = vine.compile(
  vine.object({
    resetToken: vine.string(),
    resetId: vine.string(),
    newPassword: vine.string().minLength(10),
  }),
);
