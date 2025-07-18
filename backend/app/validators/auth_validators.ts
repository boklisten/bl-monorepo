import vine from "@vinejs/vine";

import { UserDetailService } from "#services/user_detail_service";
import { UserService } from "#services/user_service";

const uniqueEmail = vine.createRule(async (value, options, field) => {
  if (typeof value !== "string") {
    return;
  }
  const foundUser = await UserService.getByUsername(value);

  if (foundUser) {
    field.report(
      `Det eksisterer allerede en konto med e-postadressen ${value}`,
      "unique_email",
      field,
    );
  }
});

const uniquePhoneNumber = vine.createRule(async (value, options, field) => {
  if (typeof value !== "string") {
    return;
  }
  const foundUser = await UserDetailService.getByPhoneNumber(value);

  if (foundUser) {
    field.report(
      `Det eksisterer allerede en konto med telefonnummeret ${value}`,
      "unique_phone",
      field,
    );
  }
});

const emailField = vine.string().trim().toLowerCase().email();
const phoneField = vine
  .string()
  .trim()
  .mobile({ locale: ["nb-NO"] });
const passwordField = vine.string().minLength(10);

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: emailField.clone(),
  }),
);

export const passwordResetValidValidator = vine.compile(
  vine.object({
    resetToken: vine.string(),
    resetId: vine.string(),
  }),
);

export const passwordResetValidator = vine.compile(
  vine.object({
    resetToken: vine.string(),
    resetId: vine.string(),
    newPassword: passwordField.clone(),
  }),
);

export const registerSchema = vine.object({
  email: emailField.clone().use(uniqueEmail()),
  phoneNumber: phoneField.clone().use(uniquePhoneNumber()),
  password: passwordField.clone(),

  name: vine.string(),
  address: vine.string(),
  postalCode: vine.string().postalCode({ countryCode: ["NO"] }),
  postalCity: vine.string(),
  dob: vine.date().before("today"),
  branchMembership: vine.string(),
  guardian: vine
    .object({
      name: vine.string(),
      email: emailField.clone(),
      phone: phoneField.clone(),
    })
    .optional(),
});

export const registerValidator = vine.compile(registerSchema);

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
