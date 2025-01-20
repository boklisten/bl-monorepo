import { UserPermission } from "@shared/permission/user-permission.js";
import { ParsedQs } from "qs";

export interface BlApiRequest {
  documentId?: string | undefined;
  query?: ParsedQs;
  data?: unknown;
  user?:
    | {
        id: string;
        details: string;
        permission: UserPermission;
      }
    | undefined;
}
