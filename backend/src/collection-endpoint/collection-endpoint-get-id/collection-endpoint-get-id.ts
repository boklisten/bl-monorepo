import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@backend/request/bl-api-request";
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
