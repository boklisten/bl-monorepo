import { BlDocument, BlError } from "@boklisten/bl-model";

import { CollectionEndpointMethod } from "@/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@/collection-endpoint/collection-endpoint-on-request";
import { SEDbQuery } from "@/query/se.db-query";
import { SEDbQueryBuilder } from "@/query/se.db-query-builder";
import { BlApiRequest } from "@/request/bl-api-request";

export class CollectionEndpointGetAll<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  public override async onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    if (
      blApiRequest.query &&
      Object.getOwnPropertyNames(blApiRequest.query).length > 0 &&
      this._endpoint.validQueryParams
    ) {
      // if the request includes a query

      const dbQueryBuilder = new SEDbQueryBuilder();
      let dbQuery: SEDbQuery;

      try {
        dbQuery = dbQueryBuilder.getDbQuery(
          blApiRequest.query,
          this._endpoint.validQueryParams,
        );
      } catch (e) {
        throw (
          new BlError("could not create query from request query string")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .add(e)
            .store("query", blApiRequest.query)
            .code(701)
        );
      }

      return await this._documentStorage.getByQuery(
        dbQuery,
        this._endpoint.nestedDocuments,
      );
    } else {
      // if no query, give back all objects in collection
      let permission = undefined;
      if (blApiRequest.user) {
        permission = blApiRequest.user.permission;
      }

      return this._documentStorage
        .getAll(permission)
        .then((docs: T[]) => {
          return docs;
        })
        .catch((blError: BlError) => {
          throw blError;
        });
    }
  }

  override async validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest> {
    return blApiRequest;
  }
}
