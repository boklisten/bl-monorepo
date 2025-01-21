import CollectionEndpointAuth from "@backend/collection-endpoint/collection-endpoint-auth.js";
import { CollectionEndpointDocumentAuth } from "@backend/collection-endpoint/collection-endpoint-document-auth.js";
import { CollectionEndpointOperation } from "@backend/collection-endpoint/collection-endpoint-operation.js";
import { createPath } from "@backend/config/api-path.js";
import { isBoolean, isNotNullish } from "@backend/helper/typescript-helpers.js";
import { Hook } from "@backend/hook/hook.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorageData } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection, BlEndpoint } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { AccessToken } from "@shared/token/access-token.js";
import { NextFunction, Request, Response, Router } from "express";

export abstract class CollectionEndpointMethod {
  protected collectionUri: string;
  protected collectionEndpointDocumentAuth: CollectionEndpointDocumentAuth;

  constructor(
    protected router: Router,
    protected endpoint: BlEndpoint,
    protected collection: BlCollection,
  ) {
    this.collectionUri = createPath(this.collection.storage.path);
    this.collectionEndpointDocumentAuth = new CollectionEndpointDocumentAuth();
  }

  public create() {
    switch (this.endpoint.method) {
      case "getAll": {
        this.router.get(this.collectionUri, this.handleRequest.bind(this));
        break;
      }
      case "getId": {
        this.router.get(
          this.collectionUri + "/:id",
          this.handleRequest.bind(this),
        );
        break;
      }
      case "post": {
        this.router.post(this.collectionUri, this.handleRequest.bind(this));
        break;
      }
      case "patch": {
        this.router.patch(
          this.collectionUri + "/:id",
          this.handleRequest.bind(this),
        );
        break;
      }
      case "delete": {
        this.router.delete(
          this.collectionUri + "/:id",
          this.handleRequest.bind(this),
        );
        break;
      }
      case "put": {
        this.router.put(
          this.collectionUri + "/:id",
          this.handleRequest.bind(this),
        );
        break;
      }
      default: {
        throw new BlError(
          `the endpoint "${this.endpoint.method}" is not supported`,
        );
      }
    }

    if (this.endpoint.operations) {
      for (const operation of this.endpoint.operations) {
        new CollectionEndpointOperation(
          this.router,
          this.collectionUri,
          this.endpoint.method,
          operation,
        ).create();
      }
    }
  }

  abstract onRequest(blApiRequest: BlApiRequest): Promise<BlStorageData>;

  abstract validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest>;

  private handleRequest(request: Request, res: Response, next: NextFunction) {
    let userAccessToken: AccessToken | undefined;
    let blApiRequest: BlApiRequest;

    const hook = this.endpoint.hook ?? new Hook();

    CollectionEndpointAuth.authenticate(
      this.endpoint.restriction,
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
        // this is the endpoint specific request handler
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

        return this.validateDocumentPermission(blApiRequest);
      })
      .then((blApiRequest) => this.onRequest(blApiRequest))
      .then((docs) =>
        this.collectionEndpointDocumentAuth.validate(
          this.endpoint.restriction,
          docs,
          blApiRequest,
          this.collection.documentPermission,
        ),
      )
      .then((docs) => hook.after(docs, userAccessToken))
      .then((docs) =>
        BlResponseHandler.sendResponse(res, new BlapiResponse(docs)),
      )
      .catch((error) => BlResponseHandler.sendErrorResponse(res, error));
  }
}
