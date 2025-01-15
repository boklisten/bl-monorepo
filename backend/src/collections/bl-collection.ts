import { Hook } from "@backend/hook/hook";
import { Operation } from "@backend/operation/operation";
import { ValidParameter } from "@backend/query/valid-param/db-query-valid-params";
import { NestedDocument } from "@backend/storage/nested-document";
import { UserPermission } from "@shared/permission/user-permission";
import { Schema } from "mongoose";

// @info This needs a type parameter to dynamically type BlStorage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BlModel<T = unknown> {
  name: string;
  schema: Schema;
}

export interface BlCollection {
  model: BlModel;
  documentPermission?: BlDocumentPermission;
  endpoints: BlEndpoint[]; //a list of the valid endpoints for this collection;
}

export interface BlEndpointRestriction {
  permissions: UserPermission[]; //a list of the permission the user needs
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
