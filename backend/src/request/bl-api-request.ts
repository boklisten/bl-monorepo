import { UserPermission } from "@shared/permission/user-permission";

export class BlApiRequest {
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
