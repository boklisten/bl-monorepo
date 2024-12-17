import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
export class CollectionEndpointPut<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  override async onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._documentStorage.put(blApiRequest.documentId, blApiRequest.data);
    return [];
  }

  override async validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest> {
    const doc = await this._documentStorage.get(blApiRequest.documentId ?? "");
    if (
      doc &&
      blApiRequest.user?.permission === "customer" &&
      doc.user?.id !== blApiRequest.user.id
    ) {
      throw new BlError(
        `user "${blApiRequest.user?.id}" cannot put document owned by ${doc.user?.id}`,
      ).code(904);
    }
    return blApiRequest;
  }
}
