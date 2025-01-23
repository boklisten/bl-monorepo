import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function create(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    await collection.storage.put(
      // @ts-expect-error fixme: auto ignored
      blApiRequest.documentId,
      blApiRequest.data,
    );
    return [];
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
        `user "${blApiRequest.user?.id}" cannot put document owned by ${document_.user?.id}`,
      ).code(904);
    }
    return blApiRequest;
  };
}

const CollectionEndpointPut = {
  create,
  createDocumentValidation,
};
export default CollectionEndpointPut;
