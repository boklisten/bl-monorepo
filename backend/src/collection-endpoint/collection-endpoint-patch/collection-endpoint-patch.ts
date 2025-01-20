import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method.js";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class CollectionEndpointPatch
  extends CollectionEndpointMethod
  implements CollectionEndpointOnRequest
{
  override async onRequest(blApiRequest: BlApiRequest) {
    const doc = await this.collection.storage
      // @ts-expect-error fixme: auto ignored
      .update(blApiRequest.documentId, blApiRequest.data);
    return [doc];
  }

  override async validateDocumentPermission(blApiRequest: BlApiRequest) {
    const document_ = await this.collection.storage.get(
      blApiRequest.documentId ?? "",
    );
    if (
      document_ &&
      blApiRequest.user?.permission === "customer" &&
      document_.user?.id !== blApiRequest.user.id
    ) {
      throw new BlError(
        `user "${blApiRequest.user?.id}" cannot patch document owned by ${document_.user?.id}`,
      ).code(904);
    }
    return blApiRequest;
  }
}
