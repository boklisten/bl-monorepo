import { PermissionService } from "@backend/lib/auth/permission.service.js";
import { logger } from "@backend/lib/config/logger.js";
import { MongooseModelCreator } from "@backend/lib/storage/mongoose-schema-creator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Types, } from "mongoose";
export class MongodbHandler {
    mongooseModel;
    path;
    constructor(model) {
        this.path = model.name;
        this.mongooseModel = new MongooseModelCreator(model).create();
    }
    // fixme: disallow undefined here, and handle missing values higher up
    async get(id) {
        const document_ = (await this.mongooseModel
            .findById(id)
            .lean({ transform: MongooseModelCreator.transformObject })
            .exec()
            .catch((error) => {
            throw this.handleError(new BlError(`error when trying to find document with id "${id}"`), error);
        }));
        if (!document_) {
            throw new BlError(`object "${id}" not found`).code(702);
        }
        return document_;
    }
    async getByQuery(databaseQuery, allowedNestedDocuments) {
        logger.silly(`mongoose.find(${JSON.stringify(databaseQuery.getFilter())}, ${JSON.stringify(databaseQuery.getOgFilter())}).limit(${databaseQuery.getLimitFilter()}).skip(${databaseQuery.getSkipFilter()}).sort(${JSON.stringify(databaseQuery.getSortFilter())})`);
        const docs = (await this.mongooseModel
            .find(databaseQuery.getFilter(), databaseQuery.getOgFilter())
            .limit(databaseQuery.getLimitFilter())
            .skip(databaseQuery.getSkipFilter())
            .sort(databaseQuery.getSortFilter())
            .lean({ transform: MongooseModelCreator.transformObject })
            .exec()
            .catch((error) => {
            throw this.handleError(new BlError(`could not find document by the provided query`), error);
        }));
        if (docs.length <= 0) {
            throw new BlError("not found").code(702);
        }
        const expandFilters = databaseQuery.getExpandFilter();
        return allowedNestedDocuments && allowedNestedDocuments.length > 0
            ? await this.retrieveNestedDocuments(docs, allowedNestedDocuments, expandFilters)
            : docs;
    }
    async getMany(ids, userPermission) {
        try {
            const idArray = ids.map((id) => new Types.ObjectId(id));
            // if user have admin privileges, he can also get documents that are inactive
            const filter = userPermission && PermissionService.isAdmin(userPermission)
                ? { _id: { $in: idArray } }
                : { _id: { $in: idArray }, active: true };
            return (await this.mongooseModel
                .find(filter)
                .lean({ transform: MongooseModelCreator.transformObject })
                .exec());
        }
        catch (error) {
            throw this.handleError(new BlError("error when trying to find documents"), error);
        }
    }
    async aggregate(aggregation) {
        const docs = await this.mongooseModel
            .aggregate(aggregation)
            .exec()
            .catch((error) => {
            throw this.handleError(new BlError("failed to aggregate documents"), error);
        });
        if (!docs) {
            throw new BlError(`aggregation returned null`);
        }
        MongooseModelCreator.transformObject({}, docs);
        return docs;
    }
    async getAll(userPermission) {
        const filter = userPermission && PermissionService.isAdmin(userPermission)
            ? {}
            : { active: true };
        const document_ = (await this.mongooseModel
            .find(filter)
            .lean({ transform: MongooseModelCreator.transformObject })
            .exec()
            .catch((error) => {
            throw this.handleError(new BlError("failed to get all documents"), error);
        }));
        if (!document_) {
            throw new BlError(`getAll returned null`);
        }
        return document_;
    }
    async add(document_, user) {
        try {
            if (user) {
                document_.user = user;
            }
            const newDocument = new this.mongooseModel({
                ...document_,
                ...(document_.id && { _id: document_.id }),
            });
            return (await newDocument.save()).toObject();
        }
        catch (error) {
            throw this.handleError(new BlError("error when trying to add document").data(document_), error);
        }
    }
    async addMany(docs) {
        const insertedDocs = await this.mongooseModel.insertMany(docs);
        return insertedDocs.map((document_) => document_.toObject());
    }
    async update(id, data) {
        const newData = { ...data, lastUpdated: new Date() };
        // Don't update the user of a document after creation
        delete newData["user"];
        const document_ = (await this.mongooseModel
            .findOneAndUpdate({ _id: id }, newData, { new: true })
            .lean({ transform: MongooseModelCreator.transformObject })
            .exec()
            .catch((error) => {
            logger.error(`failed to update document: ${error}`);
            throw this.handleError(new BlError(`failed to update document with id ${id}`).store("data", newData), error);
        }));
        if (!document_) {
            throw new BlError(`could not find document with id "${id}"`).code(702);
        }
        return document_;
    }
    async updateMany(filter, update) {
        return this.mongooseModel.updateMany(filter, update);
    }
    async put(id, data) {
        await this.mongooseModel
            .replaceOne({ _id: id }, data, {
            upsert: true,
        })
            .catch((error) => {
            throw this.handleError(new BlError("failed to PUT document").store("data", {
                data,
                _id: id,
            }), error);
        });
    }
    async remove(id) {
        const document_ = (await this.mongooseModel
            .findByIdAndDelete(id)
            .lean({ transform: MongooseModelCreator.transformObject })
            .exec()
            .catch((error) => {
            throw this.handleError(new BlError(`could not remove document with id "${id}"`), error);
        }));
        if (!document_) {
            throw new BlError(`could not remove document with id "${id}"`).code(702);
        }
        return document_;
    }
    async exists(id) {
        try {
            await this.get(id);
            return true;
        }
        catch {
            throw new BlError(`document with id ${id} does not exist`).code(702);
        }
    }
    /**
     * Tries to fetch all nested values on the specified documents.
     * @param {BlDocument[]} docs the documents to search through
     * @param allowedNestedDocuments
     * @param {ExpandFilter} expandFilters the nested documents to fetch
     */
    async retrieveNestedDocuments(docs, allowedNestedDocuments, expandFilters) {
        if (!expandFilters || expandFilters.length <= 0) {
            return docs;
        }
        const expandedNestedDocuments = allowedNestedDocuments.filter((nestedDocument) => expandFilters.some((expandFilter) => expandFilter.fieldName === nestedDocument.field));
        try {
            return await Promise.all(docs.map((document_) => this.getNestedDocuments(document_, expandedNestedDocuments)));
        }
        catch (error) {
            throw (new BlError("could not retrieve nested documents")
                .code(702)
                // @ts-expect-error fixme: auto ignored
                .add(error));
        }
    }
    async getNestedDocuments(document_, nestedDocuments) {
        const nestedDocumentsPromArray = nestedDocuments.flatMap((nestedDocument) => 
        // @ts-expect-error fixme: auto ignored
        document_ && document_[nestedDocument.field]
            ? [
                this.getNestedDocument(
                // @ts-expect-error fixme: auto ignored
                document_[nestedDocument.field], nestedDocument),
            ]
            : []);
        try {
            const nestedDocs = await Promise.all(nestedDocumentsPromArray);
            for (const [index, nestedDocument] of nestedDocuments.entries()) {
                // @ts-expect-error fixme: auto ignored
                document_[nestedDocument.field] = nestedDocs[index];
            }
            return document_;
        }
        catch {
            return document_;
        }
    }
    getNestedDocument(id, nestedDocument) {
        return nestedDocument.storage.get(id);
    }
    handleError(blError, error) {
        if (error && error instanceof Error) {
            if (error.name === "CastError") {
                return blError.code(702).store("castError", error);
            }
            else if (error.name === "ValidationError") {
                return blError.code(701).store("validationError", error);
            }
            else {
                return blError.code(200);
            }
        }
        else {
            return new BlError("EndpointMongoDb: unknown error")
                .add(blError)
                .code(200);
        }
    }
}
