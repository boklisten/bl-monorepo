import { BlDocument, UserPermission } from "@boklisten/bl-model";
import {
  FilterQuery,
  PipelineStage,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";

import { SEDbQuery } from "@/query/se.db-query";
import { NestedDocument } from "@/storage/nested-document";

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
    dbQuery: SEDbQuery,
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]>;

  getAll(
    userPermission?: UserPermission,
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]>;

  add(doc: T, user: { id: string; permission: UserPermission }): Promise<T>;

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
