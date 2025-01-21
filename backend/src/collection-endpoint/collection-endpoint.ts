import { CollectionEndpointDelete } from "@backend/collection-endpoint/collection-endpoint-delete.js";
import { CollectionEndpointGetAll } from "@backend/collection-endpoint/collection-endpoint-get-all.js";
import { CollectionEndpointGetId } from "@backend/collection-endpoint/collection-endpoint-get-id.js";
import { CollectionEndpointPatch } from "@backend/collection-endpoint/collection-endpoint-patch.js";
import { CollectionEndpointPost } from "@backend/collection-endpoint/collection-endpoint-post.js";
import { CollectionEndpointPut } from "@backend/collection-endpoint/collection-endpoint-put.js";
import { logger } from "@backend/logger/logger.js";
import { BlCollection, BlEndpoint } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Router } from "express";

export class CollectionEndpoint {
  constructor(
    private router: Router,
    private collection: BlCollection,
  ) {}

  public create() {
    for (const endpoint of this.collection.endpoints) {
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
    for (const endpoint of this.collection.endpoints) {
      let method: string = endpoint.method;
      let uri = this.collection.storage.path;

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
    const collectionEndpointGetAll = new CollectionEndpointGetAll(
      this.router,
      endpoint,
      this.collection,
    );
    collectionEndpointGetAll.create();
  }

  private createGetId(endpoint: BlEndpoint) {
    const collectionEndpointGetId = new CollectionEndpointGetId(
      this.router,
      endpoint,
      this.collection,
    );
    collectionEndpointGetId.create();
  }

  private createPost(endpoint: BlEndpoint) {
    const collectionEndpointPost = new CollectionEndpointPost(
      this.router,
      endpoint,
      this.collection,
    );
    collectionEndpointPost.create();
  }

  private createDelete(endpoint: BlEndpoint) {
    const collectionEndpointDelete = new CollectionEndpointDelete(
      this.router,
      endpoint,
      this.collection,
    );
    collectionEndpointDelete.create();
  }

  private createPatch(endpoint: BlEndpoint) {
    const collectionEndpointPatch = new CollectionEndpointPatch(
      this.router,
      endpoint,
      this.collection,
    );
    collectionEndpointPatch.create();
  }

  private createPut(endpoint: BlEndpoint) {
    const collectionEndpointPut = new CollectionEndpointPut(
      this.router,
      endpoint,
      this.collection,
    );
    collectionEndpointPut.create();
  }
}
