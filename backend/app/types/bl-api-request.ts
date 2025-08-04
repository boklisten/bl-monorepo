import { ParsedQs } from "qs";

import { UserPermission } from "#shared/user-permission";

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
