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
  private _collectionEndpointAuth: CollectionEndpointAuth;
  private _responseHandler: SEResponseHandler;

  constructor(
    protected _router: Router,
    private collectionUri: string,
    private _method: BlEndpointMethod,
    protected _operation: BlEndpointOperation,
  ) {
    this.createUri(this.collectionUri, this._operation.name, _method);
    this._collectionEndpointAuth = new CollectionEndpointAuth();
    this._responseHandler = new SEResponseHandler();
  }

  public create() {
    const uri = this.createUri(
      this.collectionUri,
      this._operation.name,
      this._method,
    );
    switch (this._method) {
      case "getId": {
        this._router.get(uri, this.handleRequest.bind(this));
        break;
      }
      case "getAll": {
        this._router.get(uri, this.handleRequest.bind(this));
        break;
      }
      case "patch": {
        this._router.patch(uri, this.handleRequest.bind(this));
        break;
      }
      case "post": {
        this._router.post(uri, this.handleRequest.bind(this));
        break;
      }
      case "put": {
        this._router.put(uri, this.handleRequest.bind(this));
        break;
      }
      default: {
        throw new Error(
          `endpoint operation method "${this._method}" is currently not supported`,
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

    this._collectionEndpointAuth
      // @ts-expect-error fixme: auto ignored
      .authenticate(this._operation.restriction, request, res, next)
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

        this._operation.operation
          .run(blApiRequest, request, res, next)
          .then((blapiResponse: BlapiResponse | boolean) => {
            if (typeof blapiResponse === "boolean") {
              return;
            }

            this._responseHandler.sendResponse(res, blapiResponse);
          })
          .catch((error) => {
            this._responseHandler.sendErrorResponse(res, error);
          });
      })
      .catch((blError: BlError) =>
        this._responseHandler.sendErrorResponse(res, blError),
      );
  }
}
