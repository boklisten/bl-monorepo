import { BlDocument } from "#shared/bl-document/bl-document";
import { UserPermission } from "#shared/permission/user-permission";

export interface User extends BlDocument {
  id: string;
  userDetail: string;
  permission: UserPermission;
  login: {
    provider: string;
    providerId: string;
  };
  blid: string;
  username: string;
  user?: {
    id: string;
    permission: UserPermission;
  };
}
