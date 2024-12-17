import {
  AccessToken,
  BlapiResponse,
  BlDocument,
  BlError,
} from "@boklisten/bl-model";
import { NextFunction, Request, Response, Router } from "express";

import { CollectionEndpointAuth } from "@/collection-endpoint/collection-endpoint-auth/collection-endpoint-auth";
import { CollectionEndpointDocumentAuth } from "@/collection-endpoint/collection-endpoint-document/collection-endpoint-document-auth";
import { CollectionEndpointOperation } from "@/collection-endpoint/collection-endpoint-operation";
import { BlDocumentPermission, BlEndpoint } from "@/collections/bl-collection";
import { ApiPath } from "@/config/api-path";
import { isBoolean, isNotNullish } from "@/helper/typescript-helpers";
import { Hook } from "@/hook/hook";
import { BlApiRequest } from "@/request/bl-api-request";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

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
      case "getAll":
        this.routerGetAll();
        break;
      case "getId":
        this.routerGetId();
        break;
      case "post":
        this.routerPost();
        break;
      case "patch":
        this.routerPatch();
        break;
      case "delete":
        this.routerDelete();
        break;
      case "put":
        this.routerPut();
        break;
      default:
        throw new BlError(
          `the endpoint "${this._endpoint.method}" is not supported`,
        );
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

  private handleRequest(req: Request, res: Response, next: NextFunction) {
    let userAccessToken: AccessToken;
    let blApiRequest: BlApiRequest;

    this._collectionEndpointAuth
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .authenticate(this._endpoint.restriction, req, res, next)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .then((accessToken?: AccessToken) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userAccessToken = accessToken;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this._endpoint.hook.before(
          req.body,
          accessToken,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          req.params.id,
          req.query,
        );
      })
      .then((hookData?: unknown) => {
        // this is the endpoint specific request handler
        let data = req.body;

        if (isNotNullish(hookData) && !isBoolean(hookData)) {
          data = hookData;
        }

        blApiRequest = {
          documentId: req.params["id"],
          query: req.query,
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._endpoint.restriction,
          docs,
          blApiRequest,
          this.documentPermission,
        ),
      )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .then((docs: T[]) => this._endpoint.hook.after(docs, userAccessToken))
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
