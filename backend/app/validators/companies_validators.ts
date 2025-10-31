import vine from "@vinejs/vine";

import {
  emailField,
  phoneField,
  postalCodeField,
} from "#validators/common/fields";

export const companyValidator = vine.compile(
  vine.object({
    name: vine.string(),
    organizationNumber: vine.string(),
    customerNumber: vine.string(),
    contactInfo: vine.object({
      phone: phoneField.clone(),
      email: emailField.clone(),
      address: vine.string(),
      postal: vine.object({
        code: postalCodeField.clone(),
        city: vine.string(),
      }),
    }),
  }),
);
