import { CollectionEndpointAuth } from "@backend/collection-endpoint/collection-endpoint-auth/collection-endpoint-auth";
import { CollectionEndpointDocumentAuth } from "@backend/collection-endpoint/collection-endpoint-document/collection-endpoint-document-auth";
import { CollectionEndpointOperation } from "@backend/collection-endpoint/collection-endpoint-operation";
import {
  BlDocumentPermission,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { ApiPath } from "@backend/config/api-path";
import { isBoolean, isNotNullish } from "@backend/helper/typescript-helpers";
import { Hook } from "@backend/hook/hook";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { AccessToken } from "@shared/token/access-token";
import { NextFunction, Request, Response, Router } from "express";

export abstract class CollectionEndpointMethod<T extends BlDocument> {
  protected collectionUri: string;
  protected collectionEndpointAuth: CollectionEndpointAuth;
  protected responseHandler: SEResponseHandler;
  protected collectionEndpointDocumentAuth: CollectionEndpointDocumentAuth<T>;

  constructor(
    protected router: Router,
    protected endpoint: BlEndpoint,
    protected collectionName: string,
    protected documentStorage: BlStorage<T>,
    protected documentPermission?: BlDocumentPermission,
  ) {
    const apiPath = new ApiPath();
    this.collectionUri = apiPath.createPath(this.collectionName);
    this.collectionEndpointAuth = new CollectionEndpointAuth();
    this.responseHandler = new SEResponseHandler();
    this.collectionEndpointDocumentAuth =
      new CollectionEndpointDocumentAuth<T>();
  }

  public create() {
    switch (this.endpoint.method) {
      case "getAll": {
        this.routerGetAll();
        break;
      }
      case "getId": {
        this.routerGetId();
        break;
      }
      case "post": {
        this.routerPost();
        break;
      }
      case "patch": {
        this.routerPatch();
        break;
      }
      case "delete": {
        this.routerDelete();
        break;
      }
      case "put": {
        this.routerPut();
        break;
      }
      default: {
        throw new BlError(
          `the endpoint "${this.endpoint.method}" is not supported`,
        );
      }
    }

    this.createOperations(this.endpoint);
  }

  abstract onRequest(blApiRequest: BlApiRequest): Promise<T[]>;

  abstract validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest>;

  private createOperations(endpoint: BlEndpoint) {
    if (endpoint.operations) {
      for (const operation of endpoint.operations) {
        const collectionEndpointOperation = new CollectionEndpointOperation(
          this.router,
          this.collectionUri,
          endpoint.method,
          operation,
        );
        collectionEndpointOperation.create();
      }
    }
  }

  private handleRequest(request: Request, res: Response, next: NextFunction) {
    let userAccessToken: AccessToken | undefined;
    let blApiRequest: BlApiRequest;

    const hook = this.endpoint.hook ?? new Hook();

    this.collectionEndpointAuth
      .authenticate(this.endpoint.restriction, request, res, next)
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
          this.documentPermission,
        ),
      )
      .then((docs) => hook.after(docs, userAccessToken))
      .then((docs) =>
        this.responseHandler.sendResponse(res, new BlapiResponse(docs)),
      )
      .catch((error) => this.responseHandler.sendErrorResponse(res, error));
  }

  private routerGetAll() {
    this.router.get(this.collectionUri, this.handleRequest.bind(this));
  }

  private routerGetId() {
    this.router.get(this.collectionUri + "/:id", this.handleRequest.bind(this));
  }

  private routerPost() {
    this.router.post(this.collectionUri, this.handleRequest.bind(this));
  }

  private routerDelete() {
    this.router.delete(
      this.collectionUri + "/:id",
      this.handleRequest.bind(this),
    );
  }

  private routerPatch() {
    this.router.patch(
      this.collectionUri + "/:id",
      this.handleRequest.bind(this),
    );
  }

  private routerPut() {
    this.router.put(this.collectionUri + "/:id", this.handleRequest.bind(this));
  }
}
