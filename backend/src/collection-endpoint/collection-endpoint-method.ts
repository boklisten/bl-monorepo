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
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { AccessToken } from "@shared/token/access-token";
import { NextFunction, Request, Response, Router } from "express";

export abstract class CollectionEndpointMethod<T extends BlDocument> {
  protected _collectionUri: string;
  protected _collectionEndpointAuth: CollectionEndpointAuth;
  protected _responseHandler: SEResponseHandler;
  protected _collectionEndpointDocumentAuth: CollectionEndpointDocumentAuth<T>;

  constructor(
    protected _router: Router,
    protected _endpoint: BlEndpoint,
    protected _collectionName: string,
    protected _documentStorage: BlDocumentStorage<T>,
    protected documentPermission?: BlDocumentPermission,
  ) {
    const apiPath = new ApiPath();
    this._collectionUri = apiPath.createPath(this._collectionName);
    this._collectionEndpointAuth = new CollectionEndpointAuth();
    this._responseHandler = new SEResponseHandler();
    this._collectionEndpointDocumentAuth =
      new CollectionEndpointDocumentAuth<T>();

    if (!_endpoint.hook) {
      this._endpoint.hook = new Hook();
    }
  }

  public create() {
    switch (this._endpoint.method) {
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
          `the endpoint "${this._endpoint.method}" is not supported`,
        );
      }
    }

    this.createOperations(this._endpoint);
  }

  abstract onRequest(blApiRequest: BlApiRequest): Promise<T[]>;

  abstract validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest>;

  private createOperations(endpoint: BlEndpoint) {
    if (endpoint.operations) {
      for (const operation of endpoint.operations) {
        const collectionEndpointOperation = new CollectionEndpointOperation(
          this._router,
          this._collectionUri,
          endpoint.method,
          operation,
        );
        collectionEndpointOperation.create();
      }
    }
  }

  private handleRequest(request: Request, res: Response, next: NextFunction) {
    let userAccessToken: AccessToken;
    let blApiRequest: BlApiRequest;

    this._collectionEndpointAuth

      // @ts-expect-error fixme: auto ignored
      .authenticate(this._endpoint.restriction, request, res, next)

      // @ts-expect-error fixme: auto ignored
      .then((accessToken?: AccessToken) => {
        // @ts-expect-error fixme: auto ignored
        userAccessToken = accessToken;

        // @ts-expect-error fixme: auto ignored
        return this._endpoint.hook.before(
          request.body,
          accessToken,

          // @ts-expect-error fixme: auto ignored
          request.params.id,
          request.query,
        );
      })
      .then((hookData?: unknown) => {
        // this is the endpoint specific request handler
        let data = request.body;

        if (isNotNullish(hookData) && !isBoolean(hookData)) {
          data = hookData;
        }

        blApiRequest = {
          documentId: request.params["id"],
          query: request.query,
          data: data,
          user: {
            id: userAccessToken.sub,
            details: userAccessToken.details,
            permission: userAccessToken.permission,
          },
        };

        return this.validateDocumentPermission(blApiRequest);
      })
      .then((blApiRequest: BlApiRequest) => this.onRequest(blApiRequest))
      .then((docs: T[]) =>
        this._collectionEndpointDocumentAuth.validate(
          // @ts-expect-error fixme: auto ignored
          this._endpoint.restriction,
          docs,
          blApiRequest,
          this.documentPermission,
        ),
      )

      // @ts-expect-error fixme: auto ignored
      .then((docs: T[]) => this._endpoint.hook.after(docs, userAccessToken))

      // @ts-expect-error fixme: auto ignored
      .then((docs: T[]) =>
        this._responseHandler.sendResponse(res, new BlapiResponse(docs)),
      )
      .catch((blError: unknown) =>
        this._responseHandler.sendErrorResponse(res, blError),
      );
  }

  private routerGetAll() {
    this._router.get(this._collectionUri, this.handleRequest.bind(this));
  }

  private routerGetId() {
    this._router.get(
      this._collectionUri + "/:id",
      this.handleRequest.bind(this),
    );
  }

  private routerPost() {
    this._router.post(this._collectionUri, this.handleRequest.bind(this));
  }

  private routerDelete() {
    this._router.delete(
      this._collectionUri + "/:id",
      this.handleRequest.bind(this),
    );
  }

  private routerPatch() {
    this._router.patch(
      this._collectionUri + "/:id",
      this.handleRequest.bind(this),
    );
  }

  private routerPut() {
    this._router.put(
      this._collectionUri + "/:id",
      this.handleRequest.bind(this),
    );
  }
}
