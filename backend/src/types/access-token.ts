import { UserPermission } from "@shared/permission/user-permission.js";

// fixme: is this dupe of the type in shared?
export interface AccessToken {
  iss: string;
  aud: string;
  iat: number;
  expiresIn: string;
  sub: string;
  username: string;
  permission: UserPermission;
  details: string;
}
