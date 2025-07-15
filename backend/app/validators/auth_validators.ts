import vine from "@vinejs/vine";

import UserHandler from "#services/auth/user/user.handler";

const uniqueEmail = vine.createRule(async (value, options, field) => {
  if (typeof value !== "string") {
    return;
  }
  const foundUser = await UserHandler.getOrNull(value);

  if (foundUser) {
    field.report(
      `Det eksisterer allerede en konto med e-postadressen ${value}`,
      "unique_email",
      field,
    );
  }
});

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

export const registerValidator = vine.compile(
  vine.object({
    email: emailField.clone().use(uniqueEmail()),
    password: passwordField.clone(),
  }),
);

export const localAuthValidator = vine.compile(
  vine.object({
    username: vine.string(),
    password: vine.string(),
  }),
);

export const tokenValidator = vine.compile(
  vine.object({
    refreshToken: vine.string().jwt(),
  }),
);
