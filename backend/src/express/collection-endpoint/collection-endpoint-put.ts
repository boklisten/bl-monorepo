import { CollectionEndpointMethod } from "@backend/express/collection-endpoint/collection-endpoint-method.js";
import { CollectionEndpointOnRequest } from "@backend/express/collection-endpoint/collection-endpoint-on-request.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlError } from "@shared/bl-error/bl-error.js";

export class CollectionEndpointPut
  extends CollectionEndpointMethod
  implements CollectionEndpointOnRequest
{
  override async onRequest(blApiRequest: BlApiRequest) {
    await this.collection.storage.put(
      // @ts-expect-error fixme: auto ignored
      blApiRequest.documentId,
      blApiRequest.data,
    );
    return [];
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
        `user "${blApiRequest.user?.id}" cannot put document owned by ${document_.user?.id}`,
      ).code(904);
    }
    return blApiRequest;
  }
}
