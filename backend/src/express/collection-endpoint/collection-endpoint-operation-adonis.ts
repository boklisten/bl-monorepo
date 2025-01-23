import { HttpContext } from "@adonisjs/core/http";
import router from "@adonisjs/core/services/router";
import BlResponseHandler from "@backend/express/response/bl-response.handler.js";
import {
  BlEndpointMethod,
  BlEndpointOperation,
} from "@backend/types/bl-collection.js";

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
  return async function handleRequest(ctx: HttpContext) {
    try {
      // TODO: authenticate
      const blApiRequest = {
        documentId: ctx.request.params()["id"],
        query: ctx.request.qs(),
        data: ctx.request.body(),
        // TODO: add user here
      };
      const operationResponse = await operation.operation.run(blApiRequest);
      BlResponseHandler.sendResponse(ctx, operationResponse);
    } catch (error) {
      BlResponseHandler.sendErrorResponse(ctx, error);
    }
  };
}

function create(
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

const CollectionEndpointOperationAdonis = {
  create,
};
export default CollectionEndpointOperationAdonis;
