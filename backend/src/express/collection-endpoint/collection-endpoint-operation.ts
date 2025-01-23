import CollectionEndpointAuth from "@backend/express/collection-endpoint/collection-endpoint-auth.js";
import { isBoolean } from "@backend/express/helper/typescript-helpers.js";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import {
  BlEndpointMethod,
  BlEndpointOperation,
} from "@backend/types/bl-collection.js";
import { NextFunction, Request, Response, Router } from "express";

function createUri(
  collectionUri: string,
  operationName: string,
  operationMethod: BlEndpointMethod,
): string {
  let uri = collectionUri;
  if (
    operationMethod === "getId" ||
    operationMethod === "patch" ||
    operationMethod === "put" ||
    operationMethod == "delete"
  ) {
    uri += "/:id";
  }
  uri += "/" + operationName;
  return uri;
}

function createRequestHandler(operation: BlEndpointOperation) {
  return async function handleRequest(
    request: Request,
    res: Response,
    next: NextFunction,
  ) {
    let blApiRequest: BlApiRequest | undefined;
    try {
      const accessToken = await CollectionEndpointAuth.authenticate(
        operation.restriction,
        request,
        res,
        next,
      );
      blApiRequest = {
        documentId: request.params["id"],
        query: request.query,
        data: request.body,
      };
      if (!isBoolean(accessToken)) {
        blApiRequest.user = {
          id: accessToken.sub,
          details: accessToken.details,
          permission: accessToken.permission,
        };
      }
      const operationResult = await operation.operation.run(
        blApiRequest,
        request,
        res,
        next,
      );
      if (isBoolean(operationResult)) {
        return;
      }
      BlResponseHandler.sendResponse(res, operationResult);
    } catch (error) {
      BlResponseHandler.sendErrorResponse(res, error);
    }
  };
}

function create(
  router: Router,
  collectionUri: string,
  method: BlEndpointMethod,
  operation: BlEndpointOperation,
) {
  const uri = createUri(collectionUri, operation.name, method);
  switch (method) {
    case "getId": {
      router.get(uri, createRequestHandler(operation));
      break;
    }
    case "getAll": {
      router.get(uri, createRequestHandler(operation));
      break;
    }
    case "patch": {
      router.patch(uri, createRequestHandler(operation));
      break;
    }
    case "post": {
      router.post(uri, createRequestHandler(operation));
      break;
    }
    case "put": {
      router.put(uri, createRequestHandler(operation));
      break;
    }
    default: {
      throw new Error(
        `endpoint operation method "${method}" is currently not supported`,
      );
    }
  }
}

const CollectionEndpointOperation = {
  create,
};
export default CollectionEndpointOperation;
