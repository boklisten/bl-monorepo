import { SEDbQueryBuilder } from "@backend/express/query/se.db-query-builder.js";
import { SEDbQuery } from "@backend/express/query/se.db-query.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection, BlEndpoint } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function onGetAll(collection: BlCollection, endpoint: BlEndpoint) {
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

function onGetId(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    const doc = await collection.storage.get(blApiRequest.documentId);
    return [doc];
  };
}

function onPost(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    if (blApiRequest.data == null) {
      throw new BlError("data is required for post operations").code(701);
    }

    try {
      return [
        // @ts-expect-error fixme bad typing
        await collection.storage.add(blApiRequest.data, blApiRequest.user),
      ];
    } catch (blError) {
      throw new BlError("could not add document").add(blError as BlError);
    }
  };
}

function onPut(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    await collection.storage.put(
      // @ts-expect-error fixme: auto ignored
      blApiRequest.documentId,
      blApiRequest.data,
    );
    return [];
  };
}

function onPatch(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    const doc = await collection.storage
      // @ts-expect-error fixme: auto ignored
      .update(blApiRequest.documentId, blApiRequest.data);
    return [doc];
  };
}

function onDelete(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    const doc = await collection.storage
      // @ts-expect-error fixme: auto ignored
      .remove(blApiRequest.documentId, {
        // @ts-expect-error fixme: auto ignored
        id: blApiRequest.user.id,
        // @ts-expect-error fixme: auto ignored
        permission: blApiRequest.user.permission,
      });
    return [doc];
  };
}

const CollectionEndpointHandler = {
  onGetAll,
  onGetId,
  onPost,
  onPut,
  onPatch,
  onDelete,
};
export default CollectionEndpointHandler;
