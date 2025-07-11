import vine from "@vinejs/vine";

export const USER_PERMISSION = {
  CUSTOMER: "customer",
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
} as const satisfies Record<Uppercase<string>, Lowercase<string>>;

export type UserPermission =
  (typeof USER_PERMISSION)[keyof typeof USER_PERMISSION];

export const userPermissionValidator = vine.enum(
  Object.values(USER_PERMISSION),
);
