import { Hook } from "@backend/hook/hook.js";
import { ValidParameter } from "@backend/query/db-query-valid-params.js";
import { BlStorageHandler } from "@backend/storage/bl-storage.js";
import { NestedDocument } from "@backend/types/nested-document.js";
import { Operation } from "@backend/types/operation.js";
import { UserPermission } from "@shared/permission/user-permission.js";

export interface BlCollection {
  storage: BlStorageHandler;
  documentPermission?: BlDocumentPermission;
  endpoints: BlEndpoint[]; //a list of the valid endpoints for this collection;
}

export interface BlEndpointRestriction {
  permission: UserPermission; // The minimum permission the user needs
  restricted?: boolean; //if set this endpoint is restricted to the user or for a user with higher permission
  secured?: boolean; //this endpoint is only accessible to the user that created it
}

export interface BlEndpointOperation {
  name: string;
  operation: Operation;
  restriction?: BlEndpointRestriction;
}

export type BlEndpointMethod =
  | "getAll"
  | "getId"
  | "getQuery"
  | "post"
  | "put"
  | "patch"
  | "delete";

export interface BlEndpoint {
  method: BlEndpointMethod;
  hook?: Hook; //an optional hook for this endpoint
  validQueryParams?: ValidParameter[];
  nestedDocuments?: NestedDocument[]; // what nested documents should be retrieved at request
  restriction?: BlEndpointRestriction; //this endpoint is only accessible to the user that created it
  operations?: BlEndpointOperation[];
}

export interface BlDocumentPermission {
  viewableForPermission: UserPermission; // the lowest permission you need to have to view documents not your own
}
