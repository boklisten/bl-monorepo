import { BlDocument } from "@shared/bl-document/bl-document";
import { UserPermission } from "@shared/permission/user-permission";

export interface User extends BlDocument {
  id: string;
  userDetail: string;
  permission: UserPermission;
  login: {
    provider: string;
    providerId: string;
  };
  blid: string;
  username: string;
  valid: boolean;
  user?: {
    id: string;
    permission: UserPermission;
  };
  primary?: boolean; // if user had multiple user details, this flag sets this to the primary
  movedToPrimary?: string; // if user had multiple user details, this is set to link to the primary user
}
