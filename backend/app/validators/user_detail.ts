import vine from "@vinejs/vine";

import {
  emailField,
  phoneField,
  postalCodeField,
} from "#validators/common/fields";
import { uniquePhoneNumber } from "#validators/common/rules";

function cleanUserInput(dirtyText: string) {
  const withCoalescedSpaces = dirtyText.replaceAll(/\s+/gu, " ").trim();
  const separators = withCoalescedSpaces.match(/[ -]/g);
  const caseCorrectedWordParts = withCoalescedSpaces
    .split(/[ -]/g)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase());
  return caseCorrectedWordParts
    .map((part, index) => part + (separators?.[index] ?? ""))
    .join("");
}

// Legacy for bl-admin user detail patching
export const userDetailPatchValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .optional()
      .transform((value) => cleanUserInput(value)),
    dob: vine.string().optional(),
    phone: vine.string().optional(),
    address: vine
      .string()
      .optional()
      .transform((value) => cleanUserInput(value)),
    postCity: vine
      .string()
      .optional()
      .transform((value) => cleanUserInput(value)),
    postCode: vine.string().optional(),
    branchMembership: vine.string().optional(),
    emailConfirmed: vine.boolean().optional(),
    guardian: vine.any().optional(),
  }),
);

// Only fields that customers are allowed to adjust after registration
const customerUpdateUserDetailsSchema = vine.object({
  phoneNumber: phoneField.clone().use(uniquePhoneNumber()),
  name: vine.string().transform((value) => cleanUserInput(value)),
  address: vine.string().transform((value) => cleanUserInput(value)),
  postalCode: postalCodeField.clone(),
  postalCity: vine.string(),
  dob: vine.date().before("today"),
  branchMembership: vine.string(),
  guardian: vine
    .object({
      name: vine.string().transform((value) => cleanUserInput(value)),
      email: emailField.clone(),
      phone: phoneField.clone(),
    })
    .optional(),
});

export const customerUpdateUserDetailsValidator = vine
  .withMetaData<{ detailsId: string }>()
  .compile(customerUpdateUserDetailsSchema);
