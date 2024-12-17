import { UserPermission } from "@boklisten/bl-model";

export interface AccessToken {
  iss: string;
  aud: string;
  expiresIn: string;
  iat: number;
  sub: string;
  username: string;
  permission: UserPermission;
  details: string;
}
