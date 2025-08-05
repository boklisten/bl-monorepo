import vine from "@vinejs/vine";

import { UserDetailService } from "#services/user_detail_service";

export const uniqueEmail = vine.createRule(async (value, options, field) => {
  if (typeof value !== "string") {
    return;
  }
  const foundUserDetail = await UserDetailService.getByEmail(value);
  const detailsId: string | null = field.meta["detailsId"] ?? null;
  if (foundUserDetail?.id === detailsId) return;

  if (foundUserDetail) {
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
    const foundUserDetail = await UserDetailService.getByPhoneNumber(value);
    const detailsId: string | null = field.meta["detailsId"] ?? null;
    if (foundUserDetail?.id === detailsId) return;

    if (foundUserDetail) {
      field.report(
        `Det eksisterer allerede en konto med telefonnummeret ${value}`,
        "unique_phone",
        field,
      );
    }
  },
);
