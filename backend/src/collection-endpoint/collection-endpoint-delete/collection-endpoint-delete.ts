import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { CollectionEndpointOnRequest } from "@backend/collection-endpoint/collection-endpoint-on-request";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";

export class CollectionEndpointDelete<T extends BlDocument>
  extends CollectionEndpointMethod<T>
  implements CollectionEndpointOnRequest<T>
{
  override onRequest(blApiRequest: BlApiRequest): Promise<T[]> {
    return (
      this._documentStorage
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .remove(blApiRequest.documentId, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          id: blApiRequest.user.id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          permission: blApiRequest.user.permission,
        })
        .then((doc: T) => {
          return [doc];
        })
        .catch((blError) => {
          throw blError;
        })
    );
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
        `user "${blApiRequest.user?.id}" cannot delete document owned by ${doc.user?.id}`,
      ).code(904);
    }
    return blApiRequest;
  }
}
