import { BlDocument } from "#shared/bl-document/bl-document";
import { UserPermission } from "#shared/permission/user-permission";

interface SocialLogin {
  userId: string;
}

interface LocalLogin {
  hashedPassword: string;
  salt: string;
}

export interface Login {
  google?: SocialLogin;
  facebook?: SocialLogin;
  local?: LocalLogin;
}

export interface User extends BlDocument {
  id: string;
  userDetail: string;
  permission: UserPermission;
  login: Login;
  blid: string;
  username: string;
  user?: {
    id: string;
    permission: UserPermission;
  };
}
