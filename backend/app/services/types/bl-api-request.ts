import { ParsedQs } from "qs";

import { UserPermission } from "#shared/permission/user-permission";

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
