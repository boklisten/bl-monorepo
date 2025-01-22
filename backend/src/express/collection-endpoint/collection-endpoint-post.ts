import { CollectionEndpointMethod } from "@backend/express/collection-endpoint/collection-endpoint-method.js";
import { CollectionEndpointOnRequest } from "@backend/express/collection-endpoint/collection-endpoint-on-request.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class CollectionEndpointPost
  extends CollectionEndpointMethod
  implements CollectionEndpointOnRequest
{
  override async onRequest(blApiRequest: BlApiRequest) {
    if (blApiRequest.data == null) {
      throw new BlError("data is required for post operations").code(701);
    }

    try {
      return [
        // @ts-expect-error fixme bad typing
        await this.collection.storage.add(blApiRequest.data, blApiRequest.user),
      ];
    } catch (blError) {
      throw new BlError("could not add document").add(blError as BlError);
    }
  }

  override async validateDocumentPermission(blApiRequest: BlApiRequest) {
    return blApiRequest;
  }
}
