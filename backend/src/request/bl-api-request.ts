import { UserPermission } from "@shared/permission/user-permission";

export interface BlApiRequest {
  documentId?: string | undefined;
  query?: unknown;
  data?: unknown;
  user?:
    | {
        id: string;
        details: string;
        permission: UserPermission;
      }
    | undefined;
}
