import { SEDbQuery } from "@backend/query/se.db-query";
import { NestedDocument } from "@backend/storage/nested-document";
import { BlDocument } from "@shared/bl-document/bl-document";
import { UserPermission } from "@shared/permission/user-permission";
import {
  FilterQuery,
  PipelineStage,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";

export interface BlStorageHandler<T extends BlDocument> {
  get(
    id: string,
    userPermission?: UserPermission,
    nestedDocuments?: NestedDocument[],
  ): Promise<T>;

  getMany(
    ids: string[],
    userPermission?: UserPermission,
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]>;

  getByQuery(
    databaseQuery: SEDbQuery,
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]>;

  getAll(
    userPermission?: UserPermission,
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]>;

  add(
    document_: T,
    user: { id: string; permission: UserPermission },
  ): Promise<T>;

  addMany(docs: T[]): Promise<T[]>;

  update(
    id: string,
    data: Partial<T>,
    user: { id: string; permission: UserPermission },
  ): Promise<T>;

  updateMany(
    ids: FilterQuery<T>,
    update: UpdateWithAggregationPipeline | UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult>;

  remove(
    id: string,
    user: { id: string; permission: UserPermission },
  ): Promise<T>;

  removeMany(ids: string[]): Promise<T[]>;

  aggregate(aggregation: PipelineStage[]): Promise<unknown[]>;

  exists(id: string): Promise<boolean>;
}
