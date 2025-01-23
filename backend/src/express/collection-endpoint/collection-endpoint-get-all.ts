import { SEDbQueryBuilder } from "@backend/express/query/se.db-query-builder.js";
import { SEDbQuery } from "@backend/express/query/se.db-query.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection, BlEndpoint } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function create(collection: BlCollection, endpoint: BlEndpoint) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    if (
      blApiRequest.query &&
      Object.getOwnPropertyNames(blApiRequest.query).length > 0 &&
      endpoint.validQueryParams
    ) {
      // if the request includes a query

      const databaseQueryBuilder = new SEDbQueryBuilder();
      let databaseQuery: SEDbQuery;

      try {
        databaseQuery = databaseQueryBuilder.getDbQuery(
          blApiRequest.query,
          endpoint.validQueryParams,
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

      return await collection.storage.getByQuery(
        databaseQuery,
        endpoint.nestedDocuments,
      );
    } else {
      // if no query, give back all objects in collection
      let permission = undefined;
      if (blApiRequest.user) {
        permission = blApiRequest.user.permission;
      }

      return collection.storage
        .getAll(permission)
        .then((docs) => {
          return docs;
        })
        .catch((blError: BlError) => {
          throw blError;
        });
    }
  };
}

async function validateDocumentPermission(
  blApiRequest: BlApiRequest,
): Promise<BlApiRequest> {
  return blApiRequest;
}

const CollectionEndpointGetAll = {
  create,
  validateDocumentPermission,
};
export default CollectionEndpointGetAll;
