import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
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
        // @ts-expect-error fixme: auto ignored
        await this.documentStorage.add(blApiRequest.data, {
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
