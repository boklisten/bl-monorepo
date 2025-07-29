import { BlDocument } from "#shared/bl-document";
import { UserPermission } from "#shared/user-permission";

interface SocialLogin {
  userId: string;
  lastLogin?: Date;
}

interface LocalLogin {
  hashedPassword: string;
  salt?: string | undefined; // fixme: Legacy, only used for the old sha256 hashing, remove when most of our hashes have been converted to argon2
  lastLogin?: Date;
}

export type SocialProvider = "google" | "facebook" | "vipps";

export interface VippsUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  address: string;
  postalCode: string;
  postalCity: string;
}

export interface Login {
  google?: SocialLogin;
  facebook?: SocialLogin;
  vipps?: SocialLogin;
  local?: LocalLogin;
  lastTokenIssuedAt?: Date;
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
