import { z } from "zod";

export const UserPermissionSchema = z.enum([
  "customer",
  "employee",
  "manager",
  "admin",
  "super",
]);

export type UserPermission = z.infer<typeof UserPermissionSchema>;
