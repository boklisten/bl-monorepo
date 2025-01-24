import { HttpContext } from "@adonisjs/core/http";
import router from "@adonisjs/core/services/router";
import CollectionEndpointAuth from "@backend/lib/collection-endpoint/collection-endpoint-auth.js";
import BlResponseHandler from "@backend/lib/response/bl-response.handler.js";
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

function createExpressRequestHandler(operation: BlEndpointOperation) {
  return async function handleRequest(ctx: HttpContext) {
    try {
      const accessToken = await CollectionEndpointAuth.authenticate(
        operation.restriction,
        ctx,
      );
      const blApiRequest = {
        documentId: ctx.request.params()["id"],
        query: ctx.request.qs(),
        data: ctx.request.body(),
        user: accessToken
          ? {
              id: accessToken.sub,
              details: accessToken.details,
              permission: accessToken.permission,
            }
          : undefined,
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
      router.get(uri, createExpressRequestHandler(operation));
      break;
    }
    case "getAll": {
      router.get(uri, createExpressRequestHandler(operation));
      break;
    }
    case "patch": {
      router.patch(uri, createExpressRequestHandler(operation));
      break;
    }
    case "post": {
      router.post(uri, createExpressRequestHandler(operation));
      break;
    }
    case "put": {
      router.put(uri, createExpressRequestHandler(operation));
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
