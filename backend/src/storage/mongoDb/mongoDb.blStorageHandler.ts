import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { logger } from "@backend/logger/logger";
import { ExpandFilter } from "@backend/query/expand-filter/db-query-expand-filter";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlStorageHandler } from "@backend/storage/blStorageHandler";
import { MongooseModelCreator } from "@backend/storage/mongoDb/mongoose-schema-creator";
import { NestedDocument } from "@backend/storage/nested-document";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import { UserPermission } from "@shared/permission/user-permission";
import {
  FilterQuery,
  Model,
  PipelineStage,
  Schema,
  Types,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";

export class MongoDbBlStorageHandler<T extends BlDocument>
  implements BlStorageHandler<T>
{
  private readonly mongooseModel: Model<T>;
  private permissionService: PermissionService;

  constructor(collectionName: BlCollectionName, schema: Schema<T>) {
    const mongooseModelCreator = new MongooseModelCreator<T>(
      collectionName,
      schema,
    );
    this.mongooseModel = mongooseModelCreator.create();
    this.permissionService = new PermissionService();
  }

  public async get(
    id: string,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userPermission?: UserPermission,
  ): Promise<T> {
    const doc = (await this.mongooseModel
      .findById<T>(id)
      .lean({ transform: MongooseModelCreator.transformObject })
      .exec()
      .catch((error) => {
        throw this.handleError(
          new BlError(`error when trying to find document with id "${id}"`),
          error,
        );
      })) as T;

    if (!doc) {
      throw new BlError(`object "${id}" not found`).code(702);
    }
    return doc;
  }

  public async getByQuery(
    dbQuery: SEDbQuery,
    allowedNestedDocuments?: NestedDocument[],
  ): Promise<T[]> {
    logger.silly(
      `mongoose.find(${JSON.stringify(dbQuery.getFilter())}, ${JSON.stringify(
        dbQuery.getOgFilter(),
      )}).limit(${dbQuery.getLimitFilter()}).skip(${dbQuery.getSkipFilter()}).sort(${JSON.stringify(
        dbQuery.getSortFilter(),
      )})`,
    );
    const docs = (await this.mongooseModel
      .find<T>(dbQuery.getFilter(), dbQuery.getOgFilter())
      .limit(dbQuery.getLimitFilter())
      .skip(dbQuery.getSkipFilter())
      .sort(dbQuery.getSortFilter())
      .lean({ transform: MongooseModelCreator.transformObject })
      .exec()
      .catch((error) => {
        throw this.handleError(
          new BlError(`could not find document by the provided query`),
          error,
        );
      })) as T[];

    if (docs.length <= 0) {
      throw new BlError("not found").code(702);
    }

    const expandFilters = dbQuery.getExpandFilter();
    if (allowedNestedDocuments && allowedNestedDocuments.length > 0) {
      return await this.retrieveNestedDocuments(
        docs,
        allowedNestedDocuments,
        expandFilters,
      );
    } else {
      return docs;
    }
  }

  public async getMany(
    ids: string[],
    userPermission?: UserPermission,
  ): Promise<T[]> {
    try {
      const idArr = ids.map((id) => new Types.ObjectId(id));
      // if user have admin privileges, he can also get documents that are inactive
      const filter =
        userPermission && this.permissionService.isAdmin(userPermission)
          ? { _id: { $in: idArr } }
          : { _id: { $in: idArr }, active: true };

      return (await this.mongooseModel
        .find<T>(filter)
        .lean({ transform: MongooseModelCreator.transformObject })
        .exec()) as T[];
    } catch (error) {
      throw this.handleError(
        new BlError("error when trying to find documents"),
        error,
      );
    }
  }

  public async aggregate(aggregation: PipelineStage[]): Promise<T[]> {
    const docs = await this.mongooseModel
      .aggregate<T>(aggregation)
      .exec()
      .catch((error) => {
        throw this.handleError(
          new BlError("failed to aggregate documents"),
          error,
        );
      });

    if (!docs) {
      throw new BlError(`aggregation returned null`);
    }
    MongooseModelCreator.transformObject({}, docs);
    return docs;
  }

  public async getAll(userPermission?: UserPermission): Promise<T[]> {
    const filter =
      userPermission && this.permissionService.isAdmin(userPermission)
        ? {}
        : { active: true };
    const doc = (await this.mongooseModel
      .find<T>(filter)
      .lean({ transform: MongooseModelCreator.transformObject })
      .exec()
      .catch((error) => {
        throw this.handleError(
          new BlError("failed to get all documents"),
          error,
        );
      })) as T[];

    if (!doc) {
      throw new BlError(`getAll returned null`);
    }
    return doc;
  }

  public async add(
    doc: T,
    user?: { id: string; permission: UserPermission },
  ): Promise<T> {
    try {
      if (user) {
        doc.user = user;
      }

      const newDocument = new this.mongooseModel({
        ...doc,
        ...(doc.id && { _id: doc.id }),
      });
      return (await newDocument.save()).toObject();
    } catch (error) {
      throw this.handleError(
        new BlError("error when trying to add document").data(doc),
        error,
      );
    }
  }

  public async addMany(docs: T[]): Promise<T[]> {
    const insertedDocs = await this.mongooseModel.insertMany(docs);
    return insertedDocs.map((doc) => doc.toObject());
  }

  public async update(
    id: string,
    data: Partial<T>,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: { id: string; permission: UserPermission },
  ): Promise<T> {
    const newData = { ...data, lastUpdated: new Date() };
    // Don't update the user of a document after creation
    delete newData["user"];

    const doc = (await this.mongooseModel
      .findOneAndUpdate<T>({ _id: id }, newData, { new: true })
      .lean({ transform: MongooseModelCreator.transformObject })
      .exec()
      .catch((error) => {
        logger.error(`failed to update document: ${error}`);
        throw this.handleError(
          new BlError(`failed to update document with id ${id}`).store(
            "data",
            newData,
          ),
          error,
        );
      })) as T;

    if (!doc) {
      throw new BlError(`could not find document with id "${id}"`).code(702);
    }

    return doc;
  }

  public async updateMany(
    filter: FilterQuery<T>,
    update: UpdateWithAggregationPipeline | UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult> {
    return this.mongooseModel.updateMany(filter, update);
  }

  public async put(id: string, data: T): Promise<void> {
    await this.mongooseModel
      .replaceOne({ _id: id }, data, {
        upsert: true,
      })
      .catch((error) => {
        throw this.handleError(
          new BlError("failed to PUT document").store("data", {
            data,
            _id: id,
          }),
          error,
        );
      });
  }

  public async remove(
    id: string,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: { id: string; permission: UserPermission },
  ): Promise<T> {
    const doc = (await this.mongooseModel
      .findByIdAndDelete<T>(id)
      .lean({ transform: MongooseModelCreator.transformObject })
      .exec()
      .catch((error) => {
        throw this.handleError(
          new BlError(`could not remove document with id "${id}"`),
          error,
        );
      })) as T;

    if (!doc) {
      throw new BlError(`could not remove document with id "${id}"`).code(702);
    }
    return doc;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public removeMany(ids: string[]): Promise<T[]> {
    throw new BlError("not implemented");
  }

  public async exists(id: string): Promise<boolean> {
    try {
      await this.get(id);
      return true;
    } catch {
      throw new BlError(`document with id ${id} does not exist`).code(702);
    }
  }

  /**
   * Tries to fetch all nested values on the specified documents.
   * @param {BlDocument[]} docs the documents to search through
   * @param allowedNestedDocuments
   * @param {ExpandFilter} expandFilters the nested documents to fetch
   * @param {UserPermission} userPermission
   */

  private async retrieveNestedDocuments(
    docs: T[],
    allowedNestedDocuments: NestedDocument[],
    expandFilters: ExpandFilter[],
    userPermission?: UserPermission,
  ): Promise<T[]> {
    if (!expandFilters || expandFilters.length <= 0) {
      return docs;
    }
    const expandedNestedDocuments = allowedNestedDocuments.filter(
      (nestedDocument) =>
        expandFilters.some(
          (expandFilter) => expandFilter.fieldName === nestedDocument.field,
        ),
    );

    try {
      return await Promise.all(
        docs.map((doc) =>
          this.getNestedDocuments(doc, expandedNestedDocuments, userPermission),
        ),
      );
    } catch (error) {
      throw (
        new BlError("could not retrieve nested documents")
          .code(702)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .add(error)
      );
    }
  }

  private async getNestedDocuments(
    doc: T,
    nestedDocuments: NestedDocument[],
    userPermission?: UserPermission,
  ): Promise<T> {
    const nestedDocumentsPromArray = nestedDocuments.flatMap((nestedDocument) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      doc && doc[nestedDocument.field]
        ? [
            this.getNestedDocument(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              doc[nestedDocument.field],
              nestedDocument,
              userPermission,
            ),
          ]
        : [],
    );

    try {
      const nestedDocs = await Promise.all(nestedDocumentsPromArray);

      for (let i = 0; i < nestedDocuments.length; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        doc[nestedDocuments[i].field] = nestedDocs[i];
      }

      return doc;
    } catch {
      return doc;
    }
  }

  private getNestedDocument(
    id: string,
    nestedDocument: NestedDocument,
    userPermission?: UserPermission,
  ): Promise<T> {
    const documentStorage = new MongoDbBlStorageHandler<T>(
      nestedDocument.collection,
      nestedDocument.mongooseSchema,
    );
    return documentStorage.get(id, userPermission);
  }

  private handleError(blError: BlError, error: unknown): BlError {
    if (error && error instanceof Error) {
      if (error.name === "CastError") {
        return blError.code(702).store("castError", error);
      } else if (error.name === "ValidationError") {
        return blError.code(701).store("validationError", error);
      } else {
        return blError.code(200);
      }
    } else {
      return new BlError("EndpointMongoDb: unknown error")
        .add(blError)
        .code(200);
    }
  }
}
