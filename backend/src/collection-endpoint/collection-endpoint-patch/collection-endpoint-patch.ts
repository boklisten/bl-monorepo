import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
export class CollectionEndpointPatch<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  override onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    return (
      this._documentStorage

        // @ts-expect-error fixme: auto ignored
        .update(blApiRequest.documentId, blApiRequest.data, {
          // @ts-expect-error fixme: auto ignored
          id: blApiRequest.user.id,

          // @ts-expect-error fixme: auto ignored
          permission: blApiRequest.user.permission,
        })
        .then((document_: T) => {
          return [document_];
        })
        .catch((blError) => {
          throw blError;
        })
    );
  }

  override async validateDocumentPermission(
    blApiRequest: BlApiRequest,
  ): Promise<BlApiRequest> {
    const document_ = await this._documentStorage.get(
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
