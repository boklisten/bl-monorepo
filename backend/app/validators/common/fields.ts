import vine from "@vinejs/vine";

export const emailField = vine.string().trim().toLowerCase().email();
export const phoneField = vine
  .string()
  .trim()
  .mobile({ locale: ["nb-NO"] });
export const passwordField = vine.string().minLength(10).maxLength(256);
export const postalCodeField = vine
  .string()
  .postalCode({ countryCode: ["NO"] });
export const percentageField = vine.number().min(0).max(1);
