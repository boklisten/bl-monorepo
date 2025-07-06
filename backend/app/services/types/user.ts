import { BlDocument } from "#shared/bl-document/bl-document";
import { UserPermission } from "#shared/permission/user-permission";

export interface User extends BlDocument {
  id: string;
  userDetail: string;
  permission: UserPermission;
  login: {
    google?: { userId: string };
    facebook?: {
      userId: string;
    };
    /**
     * fixme: add this when we migrate the local login table to users
    local?: {
      hashedPassword: string;
      salt: string;
    };
    */
  };
  blid: string;
  username: string;
  user?: {
    id: string;
    permission: UserPermission;
  };
}
