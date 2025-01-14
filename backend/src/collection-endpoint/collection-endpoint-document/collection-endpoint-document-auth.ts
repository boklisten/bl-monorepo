import { PermissionService } from "@backend/auth/permission/permission.service";
import {
  BlDocumentPermission,
  BlEndpointRestriction,
} from "@backend/collections/bl-collection";
import { isNullish } from "@backend/helper/typescript-helpers";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
export class CollectionEndpointDocumentAuth<T extends BlDocument> {
  private _permissionService: PermissionService;

  constructor() {
    this._permissionService = new PermissionService();
  }

  public validate(
    restriction: BlEndpointRestriction,
    docs: T[],
    blApiRequest: BlApiRequest,
    documentPermission?: BlDocumentPermission,
  ): Promise<T[]> {
    if (restriction) {
      if (isNullish(docs)) {
        return Promise.reject(new BlError("docs is undefined"));
      }

      if (isNullish(blApiRequest)) {
        return Promise.reject(new BlError("blApiRequest is null or undefined"));
      }

      for (const document_ of docs) {
        if (
          isNullish(document_.viewableFor) ||
          document_.viewableFor.length <= 0
        ) {
          if (restriction.restricted) {
            if (
              !this._permissionService.haveRestrictedDocumentPermission(
                // @ts-expect-error fixme: auto ignored
                blApiRequest.user.id,

                // @ts-expect-error fixme: auto ignored
                blApiRequest.user.permission,
                document_,
                restriction,
                documentPermission,
              )
            ) {
              return Promise.reject(
                new BlError(
                  "lacking restricted permission to view or edit the document",
                ).code(904),
              );
            }
          }
        } else {
          let permissionValid = false;

          if (
            this._permissionService.haveRestrictedDocumentPermission(
              // @ts-expect-error fixme: auto ignored
              blApiRequest.user.id,

              // @ts-expect-error fixme: auto ignored
              blApiRequest.user.permission,
              document_,
              restriction,
              documentPermission,
            )
          ) {
            permissionValid = true;
          } else {
            for (const id of document_.viewableFor) {
              if (id.toString() === blApiRequest.user?.id.toString()) {
                permissionValid = true;
                break;
              }
            }
          }

          if (!permissionValid) {
            return Promise.reject(
              new BlError("document is not viewable for user")
                .store("userId", blApiRequest.user?.id)
                .code(904),
            );
          }
        }
      }
    }

    return Promise.resolve(docs);
  }
}
