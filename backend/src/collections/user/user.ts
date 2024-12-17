import { UserPermission } from "@shared/permission/user-permission";

export interface User {
  id: string;
  userDetail: string;
  permission: UserPermission;
  login: {
    provider: string;
    providerId: string;
  };
  logins: {
    provider: string;
    providerId?: string;
    device?: {
      type: string;
      name: string;
    };
    time: Date;
  }[];
  blid: string;
  username: string;
  valid: boolean;
  user?: {
    id: string;
    permission: UserPermission;
  };
  active?: boolean;
  primary?: boolean; // if user had multiple user details, this flag sets this to the primary
  movedToPrimary?: string; // if user had multiple user details, this is set to link to the primary user
  lastRequest?: string;
}
