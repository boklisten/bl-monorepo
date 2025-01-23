import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function create(collection: BlCollection) {
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
function createDocumentValidation(collection: BlCollection) {
  return async function validateDocumentPermission(blApiRequest: BlApiRequest) {
    const document_ = await collection.storage.get(
      blApiRequest.documentId ?? "",
    );
    if (
      document_ &&
      blApiRequest.user?.permission === "customer" &&
      document_.user?.id !== blApiRequest.user.id
    ) {
      throw new BlError(
        `user "${blApiRequest.user?.id}" cannot delete document owned by ${document_.user?.id}`,
      ).code(904);
    }
    return blApiRequest;
  };
}

const CollectionEndpointDelete = {
  create,
  createDocumentValidation,
};

export default CollectionEndpointDelete;
