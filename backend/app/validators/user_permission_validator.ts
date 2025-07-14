import vine from "@vinejs/vine";

import { USER_PERMISSION } from "#shared/permission/user-permission";

export const userPermissionValidator = vine.enum(
  Object.values(USER_PERMISSION),
);
