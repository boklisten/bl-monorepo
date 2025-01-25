import { HttpContext } from "@adonisjs/core/http";
import router from "@adonisjs/core/services/router";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import CollectionEndpointHandler from "#services/collection-endpoint/collection-endpoint-handler";
import CollectionEndpointOperation from "#services/collection-endpoint/collection-endpoint-operation";
import { createPath } from "#services/config/api-path";
import BlResponseHandler from "#services/response/bl-response.handler";
import { BlStorageData } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { BlCollection, BlEndpoint } from "#services/types/bl-collection";

function createRequestHandler(
  endpoint: BlEndpoint,
  collection: BlCollection,
  onRequest: (blApiRequest: BlApiRequest) => Promise<BlStorageData>,
  checkDocumentPermission: boolean,
) {
  return async function handleRequest(ctx: HttpContext) {
    try {
      const accessToken = await CollectionEndpointAuth.authenticate(
        endpoint.restriction,
        ctx,
      );

      const responseData =
        await CollectionEndpointHandler.handleEndpointRequest({
          endpoint,
          collection,
          accessToken,
          requestData: ctx.request.body(),
          documentId: ctx.request.params()["id"],
          query: ctx.request.qs(),
          checkDocumentPermission,
          onRequest,
        });

      BlResponseHandler.sendResponse(ctx, new BlapiResponse(responseData));
    } catch (error) {
      BlResponseHandler.sendErrorResponse(ctx, error);
    }
  };
}

function create(endpoint: BlEndpoint, collection: BlCollection) {
  const collectionUri = createPath(collection.storage.path);
  let onRequest: (blApiRequest: BlApiRequest) => Promise<BlStorageData>;
  let checkDocumentPermission = false;
  let uri = collectionUri;
  let createRoute: (path: string, handler: (ctx: HttpContext) => void) => void;

  switch (endpoint.method) {
    case "getAll": {
      createRoute = (path, handler) => router.get(path, handler);
      onRequest = CollectionEndpointHandler.onGetAll(collection, endpoint);
      break;
    }
    case "getId": {
      uri += "/:id";
      createRoute = (path, handler) => router.get(path, handler);
      onRequest = CollectionEndpointHandler.onGetId(collection);
      break;
    }
    case "post": {
      createRoute = (path, handler) => router.post(path, handler);
      onRequest = CollectionEndpointHandler.onPost(collection);
      break;
    }
    case "patch": {
      uri += "/:id";
      createRoute = (path, handler) => router.patch(path, handler);
      onRequest = CollectionEndpointHandler.onPatch(collection);
      checkDocumentPermission = true;
      break;
    }
    case "delete": {
      uri += "/:id";
      createRoute = (path, handler) => router.delete(path, handler);
      onRequest = CollectionEndpointHandler.onDelete(collection);
      checkDocumentPermission = true;
      break;
    }
    case "put": {
      uri += "/:id";
      createRoute = (path, handler) => router.put(path, handler);
      onRequest = CollectionEndpointHandler.onPut(collection);
      checkDocumentPermission = true;
      break;
    }
    default: {
      throw new BlError(
        `the endpoint method "${endpoint.method}" is not supported`,
      );
    }
  }

  createRoute(
    uri,
    createRequestHandler(
      endpoint,
      collection,
      onRequest,
      checkDocumentPermission,
    ),
  );

  if (endpoint.operations) {
    for (const operation of endpoint.operations) {
      CollectionEndpointOperation.create(
        collectionUri,
        endpoint.method,
        operation,
      );
    }
  }
}

const CollectionEndpoint = {
  create,
};
export default CollectionEndpoint;
