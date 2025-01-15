import { BlModel } from "@backend/collections/bl-collection";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlStorageHandler } from "@backend/storage/blStorageHandler";
import { MongoDbBlStorageHandler } from "@backend/storage/mongoDb/mongoDb.blStorageHandler";
import { NestedDocument } from "@backend/storage/nested-document";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import {
  UserPermission,
  UserPermissionEnum,
} from "@shared/permission/user-permission";
import {
  FilterQuery,
  PipelineStage,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";

export class BlStorage<T extends BlDocument> implements BlStorageHandler<T> {
  private mongoDbHandler: MongoDbBlStorageHandler<T>;

  constructor(model: BlModel<T>) {
    this.mongoDbHandler = new MongoDbBlStorageHandler<T>(model);
  }

  get(id: string | undefined): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .get(id)
        .then((document_: T) => {
          resolve(document_);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  getByQuery(
    databaseQuery: SEDbQuery,
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .getByQuery(databaseQuery, nestedDocuments)
        .then((docs: T[]) => {
          resolve(docs);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  getMany(ids: string[], userPermission?: UserPermission): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .getMany(ids, userPermission)
        .then((docs: T[]) => {
          resolve(docs);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  getAll(userPermission?: UserPermission): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .getAll(userPermission)
        .then((docs: T[]) => {
          resolve(docs);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  add(
    document_: T,
    user: { id: string; permission: UserPermission } = {
      id: "SYSTEM",
      permission: UserPermissionEnum.enum.admin,
    },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .add(document_, user)
        .then((addedDocument: T) => {
          resolve(addedDocument);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  addMany(docs: T[]): Promise<T[]> {
    return this.mongoDbHandler.addMany(docs);
  }

  update(id: string, data: Partial<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .update(id, data)
        .then((updatedDocument: T) => {
          resolve(updatedDocument);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  updateMany(
    filter: FilterQuery<T>,
    update: UpdateWithAggregationPipeline | UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult> {
    return this.mongoDbHandler.updateMany(filter, update);
  }

  async put(id: string, data: T): Promise<void> {
    await this.mongoDbHandler.put(id, data);
  }

  remove(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .remove(id)
        .then((deletedDocument: T) => {
          resolve(deletedDocument);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  aggregate(aggregation: PipelineStage[]): Promise<unknown[]> {
    return this.mongoDbHandler.aggregate(aggregation);
  }

  exists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .exists(id)
        .then(() => {
          resolve(true);
        })
        .catch((existsError: BlError) => {
          reject(existsError);
        });
    });
  }
}
