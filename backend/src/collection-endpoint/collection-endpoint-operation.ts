import CollectionEndpointAuth from "@backend/collection-endpoint/collection-endpoint-auth.js";
import { isBoolean } from "@backend/helper/typescript-helpers.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import {
  BlEndpointMethod,
  BlEndpointOperation,
} from "@backend/types/bl-collection.js";
import { NextFunction, Request, Response, Router } from "express";

export class CollectionEndpointOperation {
  constructor(
    protected router: Router,
    private collectionUri: string,
    private method: BlEndpointMethod,
    protected operation: BlEndpointOperation,
  ) {}

  public create() {
    const uri = this.createUri(
      this.collectionUri,
      this.operation.name,
      this.method,
    );
    switch (this.method) {
      case "getId": {
        this.router.get(uri, this.handleRequest.bind(this));
        break;
      }
      case "getAll": {
        this.router.get(uri, this.handleRequest.bind(this));
        break;
      }
      case "patch": {
        this.router.patch(uri, this.handleRequest.bind(this));
        break;
      }
      case "post": {
        this.router.post(uri, this.handleRequest.bind(this));
        break;
      }
      case "put": {
        this.router.put(uri, this.handleRequest.bind(this));
        break;
      }
      default: {
        throw new Error(
          `endpoint operation method "${this.method}" is currently not supported`,
        );
      }
    }
  }

  private createUri(
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

  private handleRequest(request: Request, res: Response, next: NextFunction) {
    let blApiRequest: BlApiRequest | undefined;

    CollectionEndpointAuth.authenticate(
      this.operation.restriction,
      request,
      res,
      next,
    )
      .then((accessToken) => {
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
        this.operation.operation
          .run(blApiRequest, request, res, next)
          .then((result) => {
            if (isBoolean(result)) {
              return;
            }

            BlResponseHandler.sendResponse(res, result);
          })
          .catch((error) => {
            BlResponseHandler.sendErrorResponse(res, error);
          });
      })
      .catch((error) => BlResponseHandler.sendErrorResponse(res, error));
  }
}
