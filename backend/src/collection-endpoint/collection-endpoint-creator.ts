import { CollectionEndpointDelete } from "@backend/collection-endpoint/collection-endpoint-delete.js";
import { CollectionEndpointGetAll } from "@backend/collection-endpoint/collection-endpoint-get-all.js";
import { CollectionEndpointGetId } from "@backend/collection-endpoint/collection-endpoint-get-id.js";
import { CollectionEndpointPatch } from "@backend/collection-endpoint/collection-endpoint-patch.js";
import { CollectionEndpointPost } from "@backend/collection-endpoint/collection-endpoint-post.js";
import { CollectionEndpointPut } from "@backend/collection-endpoint/collection-endpoint-put.js";
import BlCollections from "@backend/collections/bl-collections.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Router } from "express";

export function createCollectionEndpoints(router: Router) {
  for (const collection of BlCollections) {
    for (const endpoint of collection.endpoints) {
      switch (endpoint.method) {
        case "getAll": {
          new CollectionEndpointGetAll(router, endpoint, collection).create();
          break;
        }
        case "getId": {
          new CollectionEndpointGetId(router, endpoint, collection).create();
          break;
        }
        case "post": {
          new CollectionEndpointPost(router, endpoint, collection).create();
          break;
        }
        case "patch": {
          new CollectionEndpointPatch(router, endpoint, collection).create();
          break;
        }
        case "put": {
          new CollectionEndpointPut(router, endpoint, collection).create();
          break;
        }
        case "delete": {
          new CollectionEndpointDelete(router, endpoint, collection).create();
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
}
