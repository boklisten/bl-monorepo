import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlCollection } from "@backend/types/bl-collection.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function create(collection: BlCollection) {
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

async function validateDocumentPermission(blApiRequest: BlApiRequest) {
  return blApiRequest;
}

const CollectionEndpointPost = {
  create,
  validateDocumentPermission,
};
export default CollectionEndpointPost;
