import { UserPermission } from "@shared/permission/user-permission";

export interface BlDocument {
  id: string;
  lastUpdated?: Date;
  creationTime?: Date;
  active?: boolean;
  user?: {
    // the user that created the document
    id: string; // the id of the user
    permission?: UserPermission; // the permission of the user
  };
  viewableFor?: string[]; // ids of other user that can edit this document if it is restricted
  viewableForPermission?: UserPermission; //the lowest permission user needs to view this document
  editableFor?: string[]; //ids of other users that can edit this document if it is restricted
}
