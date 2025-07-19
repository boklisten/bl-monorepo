import { BlDocument } from "#shared/bl-document/bl-document";
import { UserPermission } from "#shared/permission/user-permission";

interface SocialLogin {
  userId: string;
}

interface LocalLogin {
  hashedPassword: string;
  salt?: string | undefined; // fixme: Legacy, only used for the old sha256 hashing, remove when most of our hashes have been converted to argon2
}

export type SocialProvider = "google" | "facebook" | "vipps";

export interface Login {
  google?: SocialLogin;
  facebook?: SocialLogin;
  vipps?: SocialLogin;
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
