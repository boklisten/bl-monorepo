import { UserPermission } from "#shared/permission/user-permission";

export interface BlDocument {
  id: string;
  lastUpdated?: Date;
  creationTime?: Date;
  active?: boolean;
  user?: {
    id: string;
    permission?: UserPermission;
  };
  viewableFor?: string[];
  viewableForPermission?: UserPermission;
  editableFor?: string[];
}
