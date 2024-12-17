import { BlDocument, BlError } from "@boklisten/bl-model";

import { CollectionEndpointMethod } from "@/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@/request/bl-api-request";

export class CollectionEndpointPost<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  override async onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    if (blApiRequest.data == null || blApiRequest.user == null) {
      throw new BlError("data and user is required for post operations").code(
        701,
      );
    }

    try {
      return [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this._documentStorage.add(blApiRequest.data, {
          id: blApiRequest.user.id,
          permission: blApiRequest.user.permission,
        }),
      ];
    } catch (blError) {
      throw new BlError("could not add document").add(blError as BlError);
    }
  }

  override async validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest> {
    return blApiRequest;
  }
}
