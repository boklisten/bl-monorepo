import CollectionEndpointDocumentAuth from "@backend/lib/collection-endpoint/collection-endpoint-document-auth.js";
import { isBoolean, isNotNullish, } from "@backend/lib/helper/typescript-helpers.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { SEDbQueryBuilder } from "@backend/lib/query/se.db-query-builder.js";
import { BlError } from "@shared/bl-error/bl-error.js";
function onGetAll(collection, endpoint) {
    return async function onRequest(blApiRequest) {
        if (blApiRequest.query &&
            Object.getOwnPropertyNames(blApiRequest.query).length > 0 &&
            endpoint.validQueryParams) {
            // if the request includes a query
            const databaseQueryBuilder = new SEDbQueryBuilder();
            let databaseQuery;
            try {
                databaseQuery = databaseQueryBuilder.getDbQuery(blApiRequest.query, endpoint.validQueryParams);
            }
            catch (error) {
                throw (new BlError("could not create query from request query string")
                    // @ts-expect-error fixme: auto ignored
                    .add(error)
                    .store("query", blApiRequest.query)
                    .code(701));
            }
            return await collection.storage.getByQuery(databaseQuery, endpoint.nestedDocuments);
        }
        else {
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
                .catch((blError) => {
                throw blError;
            });
        }
    };
}
function onGetId(collection) {
    return async function onRequest(blApiRequest) {
        const doc = await collection.storage.get(blApiRequest.documentId);
        return [doc];
    };
}
function onPost(collection) {
    return async function onRequest(blApiRequest) {
        if (blApiRequest.data == null) {
            throw new BlError("data is required for post operations").code(701);
        }
        try {
            return [
                // @ts-expect-error fixme bad typing
                await collection.storage.add(blApiRequest.data, blApiRequest.user),
            ];
        }
        catch (blError) {
            throw new BlError("could not add document").add(blError);
        }
    };
}
function onPut(collection) {
    return async function onRequest(blApiRequest) {
        await collection.storage.put(
        // @ts-expect-error fixme: auto ignored
        blApiRequest.documentId, blApiRequest.data);
        return [];
    };
}
function onPatch(collection) {
    return async function onRequest(blApiRequest) {
        const doc = await collection.storage
            // @ts-expect-error fixme: auto ignored
            .update(blApiRequest.documentId, blApiRequest.data);
        return [doc];
    };
}
function onDelete(collection) {
    return async function onRequest(blApiRequest) {
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
async function validateDocumentPermission(blApiRequest, storageHandler, method) {
    const document_ = await storageHandler.get(blApiRequest.documentId ?? "");
    if (document_ &&
        blApiRequest.user?.permission === "customer" &&
        document_.user?.id !== blApiRequest.user.id) {
        throw new BlError(`user "${blApiRequest.user?.id}" cannot ${method} document owned by ${document_.user?.id}`).code(904);
    }
}
async function handleEndpointRequest({ endpoint, collection, accessToken, requestData, documentId, query, checkDocumentPermission, onRequest, }) {
    const hook = endpoint.hook ?? new Hook();
    const beforeData = await hook.before(requestData, accessToken, documentId, query);
    const blApiRequest = {
        documentId,
        query: query,
        data: isNotNullish(beforeData) && !isBoolean(beforeData)
            ? beforeData
            : requestData,
        user: accessToken
            ? {
                id: accessToken.sub,
                details: accessToken.details,
                permission: accessToken.permission,
            }
            : undefined,
    };
    if (checkDocumentPermission) {
        await validateDocumentPermission(blApiRequest, collection.storage, endpoint.method);
    }
    const responseData = await onRequest(blApiRequest);
    await CollectionEndpointDocumentAuth.validate(endpoint.restriction, responseData, blApiRequest, collection.documentPermission);
    return await hook.after(responseData, accessToken);
}
const CollectionEndpointHandler = {
    onGetAll,
    onGetId,
    onPost,
    onPut,
    onPatch,
    onDelete,
    handleEndpointRequest,
};
export default CollectionEndpointHandler;
