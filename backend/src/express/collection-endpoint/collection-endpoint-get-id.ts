import { CollectionEndpointMethod } from "@backend/express/collection-endpoint/collection-endpoint-method.js";
import { CollectionEndpointOnRequest } from "@backend/express/collection-endpoint/collection-endpoint-on-request.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
export class CollectionEndpointGetId
  extends CollectionEndpointMethod
  implements CollectionEndpointOnRequest
{
  public override async onRequest(blApiRequest: BlApiRequest) {
    const doc = await this.collection.storage.get(blApiRequest.documentId);
    return [doc];
  }

  override async validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest> {
    return blApiRequest;
  }
}
