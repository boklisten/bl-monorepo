import { CollectionEndpointAuth } from "@backend/collection-endpoint/collection-endpoint-auth/collection-endpoint-auth";
import {
  BlEndpointMethod,
  BlEndpointOperation,
} from "@backend/collections/bl-collection";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { NextFunction, Request, Response, Router } from "express";

export class CollectionEndpointOperation {
  private collectionEndpointAuth = new CollectionEndpointAuth();
  private responseHandler = new SEResponseHandler();

  constructor(
    protected router: Router,
    private collectionUri: string,
    private method: BlEndpointMethod,
    protected operation: BlEndpointOperation,
  ) {
    this.createUri(this.collectionUri, this.operation.name, method);
  }

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
    let blApiRequest: BlApiRequest;

    this.collectionEndpointAuth
      // @ts-expect-error fixme: auto ignored
      .authenticate(this.operation.restriction, request, res, next)
      // @ts-expect-error fixme: auto ignored
      .then((accessToken?: AccessToken) => {
        blApiRequest = {
          documentId: request.params["id"],
          query: request.query,
          data: request.body,
          user: {
            id: accessToken.sub,
            details: accessToken.details,
            permission: accessToken.permission,
          },
        };

        this.operation.operation
          .run(blApiRequest, request, res, next)
          .then((blapiResponse: BlapiResponse | boolean) => {
            if (typeof blapiResponse === "boolean") {
              return;
            }

            this.responseHandler.sendResponse(res, blapiResponse);
          })
          .catch((error) => {
            this.responseHandler.sendErrorResponse(res, error);
          });
      })
      .catch((blError: BlError) =>
        this.responseHandler.sendErrorResponse(res, blError),
      );
  }
}
