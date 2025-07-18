import vine from "@vinejs/vine";

import { UserDetailService } from "#services/user_detail_service";
import { UserService } from "#services/user_service";

export const uniqueEmail = vine.createRule(async (value, options, field) => {
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

export const uniquePhoneNumber = vine.createRule(
  async (value, options, field) => {
    if (typeof value !== "string") {
      return;
    }
    const foundUser = await UserDetailService.getByPhoneNumber(value);
    const detailsId: string | null = field.meta["detailsId"] ?? null;
    if (foundUser?.id === detailsId) return;

    if (foundUser) {
      field.report(
        `Det eksisterer allerede en konto med telefonnummeret ${value}`,
        "unique_phone",
        field,
      );
    }
  },
);
