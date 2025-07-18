import vine from "@vinejs/vine";

import {
  emailField,
  passwordField,
  phoneField,
  postalCodeField,
} from "#validators/common/fields";
import { uniqueEmail, uniquePhoneNumber } from "#validators/common/rules";

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
  postalCode: postalCodeField.clone(),
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
