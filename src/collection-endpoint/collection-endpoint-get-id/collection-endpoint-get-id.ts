import { BlDocument, BlError } from "@boklisten/bl-model";

import { CollectionEndpointMethod } from "@/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@/request/bl-api-request";

export class CollectionEndpointGetId<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  public override onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new Promise((resolve, reject) => {
      this._documentStorage // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .get(blApiRequest.documentId, blApiRequest.user.permission)
        .then((doc: T) => {
          resolve([doc]);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  override async validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest> {
    return blApiRequest;
  }
}
