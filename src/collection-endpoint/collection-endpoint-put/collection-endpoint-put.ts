import { BlDocument, BlError } from "@boklisten/bl-model";

import { CollectionEndpointMethod } from "@/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@/request/bl-api-request";

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
