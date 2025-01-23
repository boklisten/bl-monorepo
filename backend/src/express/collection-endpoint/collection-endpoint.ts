import CollectionEndpointAuth from "@backend/express/collection-endpoint/collection-endpoint-auth.js";
import CollectionEndpointHandler from "@backend/express/collection-endpoint/collection-endpoint-handler.js";
import CollectionEndpointOperation from "@backend/express/collection-endpoint/collection-endpoint-operation.js";
import { createPath } from "@backend/express/config/api-path.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorageData } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection, BlEndpoint } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";

function createExpressRequestHandler(
  endpoint: BlEndpoint,
  collection: BlCollection,
  onRequest: (blApiRequest: BlApiRequest) => Promise<BlStorageData>,
  checkDocumentPermission: boolean,
) {
  return async function handleRequest(
    request: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const accessToken = await CollectionEndpointAuth.authenticate(
        endpoint.restriction,
        request,
        res,
        next,
      );

      const responseData =
        await CollectionEndpointHandler.handleEndpointRequest({
          endpoint,
          collection,
          accessToken,
          requestData: request.body,
          documentId: request.params["id"],
          query: request.query,
          checkDocumentPermission,
          onRequest,
        });

      BlResponseHandler.sendResponse(res, new BlapiResponse(responseData));
    } catch (error) {
      BlResponseHandler.sendErrorResponse(res, error);
    }
  };
}

function create(
  router: Router,
  endpoint: BlEndpoint,
  collection: BlCollection,
) {
  const collectionUri = createPath(collection.storage.path);
  let onRequest: (blApiRequest: BlApiRequest) => Promise<BlStorageData>;
  let checkDocumentPermission = false;
  let uri = collectionUri;
  let createRoute: (path: string, handler: RequestHandler) => void;

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
    createExpressRequestHandler(
      endpoint,
      collection,
      onRequest,
      checkDocumentPermission,
    ),
  );

  if (endpoint.operations) {
    for (const operation of endpoint.operations) {
      CollectionEndpointOperation.create(
        router,
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
