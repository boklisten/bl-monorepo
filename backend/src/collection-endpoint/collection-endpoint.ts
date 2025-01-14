import { PermissionService } from "@backend/auth/permission/permission.service";
import { CollectionEndpointDelete } from "@backend/collection-endpoint/collection-endpoint-delete/collection-endpoint-delete";
import { CollectionEndpointGetAll } from "@backend/collection-endpoint/collection-endpoint-get-all/collection-endpoint-get-all";
import { CollectionEndpointGetId } from "@backend/collection-endpoint/collection-endpoint-get-id/collection-endpoint-get-id";
import { CollectionEndpointPatch } from "@backend/collection-endpoint/collection-endpoint-patch/collection-endpoint-patch";
import { CollectionEndpointPost } from "@backend/collection-endpoint/collection-endpoint-post/collection-endpoint-post";
import { CollectionEndpointPut } from "@backend/collection-endpoint/collection-endpoint-put/collection-endpoint-put";
import { BlCollection, BlEndpoint } from "@backend/collections/bl-collection";
import { ApiPath } from "@backend/config/api-path";
import { logger } from "@backend/logger/logger";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import { Router } from "express";

export class CollectionEndpoint<T extends BlDocument> {
  private readonly _documentStorage: BlDocumentStorage<T>;

  constructor(
    private _router: Router,
    private _collection: BlCollection,
  ) {
    this._documentStorage = new BlDocumentStorage<T>(
      _collection.collectionName,
      _collection.mongooseSchema,
    );
    new PermissionService();
    new ApiPath();
  }

  public create() {
    for (const endpoint of this._collection.endpoints) {
      switch (endpoint.method) {
        case "getAll": {
          this.createGetAll(endpoint);
          break;
        }
        case "getId": {
          this.createGetId(endpoint);
          break;
        }
        case "post": {
          this.createPost(endpoint);
          break;
        }
        case "patch": {
          this.createPatch(endpoint);
          break;
        }
        case "put": {
          this.createPut(endpoint);
          break;
        }
        case "delete": {
          this.createDelete(endpoint);
          break;
        }
        default: {
          throw new BlError(
            `the collection endpoint method "${endpoint.method}" is not supported`,
          );
        }
      }
    }
  }

  public printEndpoints() {
    for (const endpoint of this._collection.endpoints) {
      let method: string = endpoint.method;
      let uri = this._collection.collectionName.toString();

      if (method === "getAll" || method === "getId") {
        method = "get";
      }

      if (
        endpoint.method === "getId" ||
        endpoint.method === "patch" ||
        endpoint.method === "delete" ||
        endpoint.method === "put"
      ) {
        uri += "/:id";
      }

      const methodOutput =
        method.toUpperCase() + (method.length < 5 ? "  " : "");
      const output = methodOutput + "\t" + uri;

      logger.silly(output);

      if (endpoint.operations) {
        for (const operation of endpoint.operations) {
          const operationUri = uri + "/" + operation.name;
          const operationOutput = methodOutput + "\t" + operationUri;
          logger.silly(operationOutput);
        }
      }
    }
  }

  private createGetAll(endpoint: BlEndpoint) {
    const collectionEndpointGetAll = new CollectionEndpointGetAll<T>(
      this._router,
      endpoint,
      this._collection.collectionName,
      this._documentStorage,
      this._collection.documentPermission,
    );
    collectionEndpointGetAll.create();
  }

  private createGetId(endpoint: BlEndpoint) {
    const collectionEndpointGetId = new CollectionEndpointGetId<T>(
      this._router,
      endpoint,
      this._collection.collectionName,
      this._documentStorage,
      this._collection.documentPermission,
    );
    collectionEndpointGetId.create();
  }

  private createPost(endpoint: BlEndpoint) {
    const collectionEndpointPost = new CollectionEndpointPost<T>(
      this._router,
      endpoint,
      this._collection.collectionName,
      this._documentStorage,
      this._collection.documentPermission,
    );
    collectionEndpointPost.create();
  }

  private createDelete(endpoint: BlEndpoint) {
    const collectionEndpointDelete = new CollectionEndpointDelete<T>(
      this._router,
      endpoint,
      this._collection.collectionName,
      this._documentStorage,
      this._collection.documentPermission,
    );
    collectionEndpointDelete.create();
  }

  private createPatch(endpoint: BlEndpoint) {
    const collectionEndpointPatch = new CollectionEndpointPatch<T>(
      this._router,
      endpoint,
      this._collection.collectionName,
      this._documentStorage,
      this._collection.documentPermission,
    );
    collectionEndpointPatch.create();
  }

  private createPut(endpoint: BlEndpoint) {
    const collectionEndpointPut = new CollectionEndpointPut<T>(
      this._router,
      endpoint,
      this._collection.collectionName,
      this._documentStorage,
      this._collection.documentPermission,
    );
    collectionEndpointPut.create();
  }
}
