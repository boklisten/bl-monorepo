import { UserPermission } from "../permission/user-permission";

export class AccessToken {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  username: string;
  permission: UserPermission;
  details: string;
}
