import { UserPermission } from "@shared/permission/user-permission.js";

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
