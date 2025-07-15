import vine from "@vinejs/vine";

const emailField = vine.string().email().trim().toLowerCase();
const passwordField = vine.string().minLength(10);

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: emailField.clone(),
  }),
);

export const passwordResetValidator = vine.compile(
  vine.object({
    resetToken: vine.string(),
    resetId: vine.string(),
    newPassword: passwordField.clone(),
  }),
);

export const localAuthValidator = vine.compile(
  vine.object({
    username: emailField.clone(),
    password: vine.string(), // fixme: eventually replace with passwordField.clone(), but remember to handle validation error in frontend
  }),
);

export const tokenValidator = vine.compile(
  vine.object({
    refreshToken: vine.string().jwt(),
  }),
);
