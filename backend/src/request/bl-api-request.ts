import { UserPermission } from "@boklisten/bl-model";

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
