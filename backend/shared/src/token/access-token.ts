import { UserPermission } from "#shared/permission/user-permission";

export interface AccessToken {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  username: string;
  permission: UserPermission;
  details: string;
}
