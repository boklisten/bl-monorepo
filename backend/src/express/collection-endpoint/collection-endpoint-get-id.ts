import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection } from "@backend/types/bl-collection.js";

function create(collection: BlCollection) {
  return async function onRequest(blApiRequest: BlApiRequest) {
    const doc = await collection.storage.get(blApiRequest.documentId);
    return [doc];
  };
}
async function validateDocumentPermission(
  blApiRequest: BlApiRequest,
): Promise<BlApiRequest> {
  return blApiRequest;
}

const CollectionEndpointGetId = {
  create,
  validateDocumentPermission,
};

export default CollectionEndpointGetId;
