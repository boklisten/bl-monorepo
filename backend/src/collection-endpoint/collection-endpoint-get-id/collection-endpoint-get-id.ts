import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
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
        .then((document_: T) => {
          resolve([document_]);
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
