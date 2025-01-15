import { CollectionEndpointAuth } from "@backend/collection-endpoint/collection-endpoint-auth/collection-endpoint-auth";
import {
  BlEndpointMethod,
  BlEndpointOperation,
} from "@backend/collections/bl-collection";
import { isBoolean } from "@backend/helper/typescript-helpers";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { NextFunction, Request, Response, Router } from "express";

export class CollectionEndpointOperation {
  private collectionEndpointAuth = new CollectionEndpointAuth();
  private responseHandler = new SEResponseHandler();

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

    this.collectionEndpointAuth
      .authenticate(this.operation.restriction, request, res, next)
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

            this.responseHandler.sendResponse(res, result);
          })
          .catch((error) => {
            this.responseHandler.sendErrorResponse(res, error);
          });
      })
      .catch((error) => this.responseHandler.sendErrorResponse(res, error));
  }
}
