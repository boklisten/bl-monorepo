/* eslint-disable @typescript-eslint/no-unused-vars */

import { BlCollectionName } from "@backend/collections/bl-collection";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlStorageHandler } from "@backend/storage/blStorageHandler";
import { MongoDbBlStorageHandler } from "@backend/storage/mongoDb/mongoDb.blStorageHandler";
import { NestedDocument } from "@backend/storage/nested-document";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import { UserPermission } from "@shared/permission/user-permission";
import {
  FilterQuery,
  PipelineStage,
  Schema,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";

export class BlDocumentStorage<T extends BlDocument>
  implements BlStorageHandler<T>
{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private mongoDbHandler: MongoDbBlStorageHandler<T>;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private collectionName: BlCollectionName,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private mongooseSchema?: Schema,
  ) {
    if (mongooseSchema) {
      this.mongoDbHandler = new MongoDbBlStorageHandler<T>(
        collectionName,
        mongooseSchema,
      );
    }
  }

  get(id: string, userPermission?: UserPermission): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .get(id, userPermission)
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

  getMany(
    ids: string[],
    userPermission?: UserPermission,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]> {
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

  getAll(
    userPermission?: UserPermission,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    nestedDocuments?: NestedDocument[],
  ): Promise<T[]> {
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
    user: { id: string; permission: UserPermission },
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

  update(
    id: string,
    data: Partial<T>,
    user: { id: string; permission: UserPermission },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .update(id, data, user)
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

  remove(
    id: string,
    user: { id: string; permission: UserPermission },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mongoDbHandler
        .remove(id, user)
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  removeMany(ids: string[]): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new Promise((resolve, reject) => {
      reject(new BlError("not implemented"));
    });
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
