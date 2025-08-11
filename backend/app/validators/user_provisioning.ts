import vine from "@vinejs/vine";

import {
  emailField,
  phoneField,
  postalCodeField,
} from "#validators/common/fields";

export const userProvisioningValidator = vine.compile(
  vine.object({
    userCandidates: vine.array(
      vine.object({
        name: vine.string(),
        phone: phoneField.clone(),
        email: emailField.clone(),
        branchName: vine.string(),

        address: vine.string().optional(),
        postalCode: postalCodeField.clone().optional(),
        postalCity: vine.string().optional(),
        dob: vine.date().optional(),
      }),
    ),
  }),
);
