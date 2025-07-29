import vine from "@vinejs/vine";

import { USER_PERMISSION } from "#shared/user-permission";

export const userPermissionValidator = vine.enum(
  Object.values(USER_PERMISSION),
);
