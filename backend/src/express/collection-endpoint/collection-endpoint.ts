import CollectionEndpointAuth from "@backend/express/collection-endpoint/collection-endpoint-auth.js";
import CollectionEndpointDelete from "@backend/express/collection-endpoint/collection-endpoint-delete.js";
import CollectionEndpointDocumentAuth from "@backend/express/collection-endpoint/collection-endpoint-document-auth.js";
import CollectionEndpointGetAll from "@backend/express/collection-endpoint/collection-endpoint-get-all.js";
import CollectionEndpointGetId from "@backend/express/collection-endpoint/collection-endpoint-get-id.js";
import CollectionEndpointOperation from "@backend/express/collection-endpoint/collection-endpoint-operation.js";
import CollectionEndpointPatch from "@backend/express/collection-endpoint/collection-endpoint-patch.js";
import CollectionEndpointPost from "@backend/express/collection-endpoint/collection-endpoint-post.js";
import CollectionEndpointPut from "@backend/express/collection-endpoint/collection-endpoint-put.js";
import { createPath } from "@backend/express/config/api-path.js";
import {
  isBoolean,
  isNotNullish,
} from "@backend/express/helper/typescript-helpers.js";
import { Hook } from "@backend/express/hook/hook.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlStorageData } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection, BlEndpoint } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { AccessToken } from "@shared/token/access-token.js";
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";

function createRequestHandler(
  endpoint: BlEndpoint,
  collection: BlCollection,
  onRequest: (blApiRequest: BlApiRequest) => Promise<BlStorageData>,
  validateDocumentPermission: (
    blApiRequest: BlApiRequest,
  ) => Promise<BlApiRequest>,
) {
  return function handleRequest(
    request: Request,
    res: Response,
    next: NextFunction,
  ) {
    let userAccessToken: AccessToken | undefined;
    let blApiRequest: BlApiRequest;

    const hook = endpoint.hook ?? new Hook();

    CollectionEndpointAuth.authenticate(
      endpoint.restriction,
      request,
      res,
      next,
    )
      .then((authResult) => {
        if (!isBoolean(authResult)) {
          userAccessToken = authResult;
        }
        return hook.before(
          request.body,
          userAccessToken,
          request.params["id"],
          request.query,
        );
      })
      .then((hookData) => {
        // is the endpoint specific request handler
        let data = request.body;

        if (isNotNullish(hookData) && !isBoolean(hookData)) {
          data = hookData;
        }

        blApiRequest = {
          documentId: request.params["id"],
          query: request.query,
          data: data,
        };
        if (userAccessToken !== undefined) {
          blApiRequest.user = {
            id: userAccessToken.sub,
            details: userAccessToken.details,
            permission: userAccessToken.permission,
          };
        }

        return validateDocumentPermission(blApiRequest);
      })
      .then((blApiRequest) => onRequest(blApiRequest))
      .then((docs) =>
        CollectionEndpointDocumentAuth.validate(
          endpoint.restriction,
          docs,
          blApiRequest,
          collection.documentPermission,
        ),
      )
      .then((docs) => hook.after(docs, userAccessToken))
      .then((docs) =>
        BlResponseHandler.sendResponse(res, new BlapiResponse(docs)),
      )
      .catch((error) => BlResponseHandler.sendErrorResponse(res, error));
  };
}

function create(
  router: Router,
  endpoint: BlEndpoint,
  collection: BlCollection,
) {
  const collectionUri = createPath(collection.storage.path);
  let onRequest: (blApiRequest: BlApiRequest) => Promise<BlStorageData>;
  let validateDocumentPermission: (
    blApiRequest: BlApiRequest,
  ) => Promise<BlApiRequest>;
  let uri = collectionUri;
  let createRoute: (path: string, handler: RequestHandler) => void;

  switch (endpoint.method) {
    case "getAll": {
      createRoute = (path, handler) => router.get(path, handler);
      onRequest = CollectionEndpointGetAll.create(collection, endpoint);
      validateDocumentPermission =
        CollectionEndpointGetAll.validateDocumentPermission;
      break;
    }
    case "getId": {
      uri += "/:id";
      createRoute = (path, handler) => router.get(path, handler);
      onRequest = CollectionEndpointGetId.create(collection);
      validateDocumentPermission =
        CollectionEndpointGetId.validateDocumentPermission;
      break;
    }
    case "post": {
      createRoute = (path, handler) => router.post(path, handler);
      onRequest = CollectionEndpointPost.create(collection);
      validateDocumentPermission =
        CollectionEndpointPost.validateDocumentPermission;
      break;
    }
    case "patch": {
      uri += "/:id";
      createRoute = (path, handler) => router.patch(path, handler);
      onRequest = CollectionEndpointPatch.create(collection);
      validateDocumentPermission =
        CollectionEndpointPatch.createDocumentValidation(collection);
      break;
    }
    case "delete": {
      uri += "/:id";
      createRoute = (path, handler) => router.delete(path, handler);
      onRequest = CollectionEndpointDelete.create(collection);
      validateDocumentPermission =
        CollectionEndpointDelete.createDocumentValidation(collection);
      break;
    }
    case "put": {
      uri += "/:id";
      createRoute = (path, handler) => router.put(path, handler);
      onRequest = CollectionEndpointPut.create(collection);
      validateDocumentPermission =
        CollectionEndpointPut.createDocumentValidation(collection);
      break;
    }
    default: {
      throw new BlError(
        `the endpoint method "${endpoint.method}" is not supported`,
      );
    }
  }

  const requestHandler = createRequestHandler(
    endpoint,
    collection,
    onRequest,
    validateDocumentPermission,
  );

  createRoute(uri, requestHandler);

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
