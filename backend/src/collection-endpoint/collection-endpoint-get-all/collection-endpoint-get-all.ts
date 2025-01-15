import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { SEDbQuery } from "@backend/query/se.db-query";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
export class CollectionEndpointGetAll<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  public override async onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    if (
      blApiRequest.query &&
      Object.getOwnPropertyNames(blApiRequest.query).length > 0 &&
      this.endpoint.validQueryParams
    ) {
      // if the request includes a query

      const databaseQueryBuilder = new SEDbQueryBuilder();
      let databaseQuery: SEDbQuery;

      try {
        databaseQuery = databaseQueryBuilder.getDbQuery(
          blApiRequest.query,
          this.endpoint.validQueryParams,
        );
      } catch (error) {
        throw (
          new BlError("could not create query from request query string")

            // @ts-expect-error fixme: auto ignored
            .add(error)
            .store("query", blApiRequest.query)
            .code(701)
        );
      }

      return await this.documentStorage.getByQuery(
        databaseQuery,
        this.endpoint.nestedDocuments,
      );
    } else {
      // if no query, give back all objects in collection
      let permission = undefined;
      if (blApiRequest.user) {
        permission = blApiRequest.user.permission;
      }

      return this.documentStorage
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
