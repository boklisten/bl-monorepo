import { HttpContext } from "@adonisjs/core/http";
import router from "@adonisjs/core/services/router";

import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import BlResponseHandler from "#services/response/bl-response.handler";
import {
  BlEndpointMethod,
  BlEndpointOperation,
} from "#services/types/bl-collection";

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
      return await operation.operation.run(blApiRequest);
    } catch (error) {
      return BlResponseHandler.createErrorResponse(ctx, error);
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

const CollectionEndpointOperation = {
  create,
};
export default CollectionEndpointOperation;
