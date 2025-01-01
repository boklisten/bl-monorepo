import { z } from "zod";

export const UserPermissionEnum = z.enum([
  "customer",
  "employee",
  "manager",
  "admin",
  "super",
]);

export type UserPermission = z.infer<typeof UserPermissionEnum>;
