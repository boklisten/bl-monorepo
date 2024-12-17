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

      for (const doc of docs) {
        if (isNullish(doc.viewableFor) || doc.viewableFor.length <= 0) {
          if (restriction.restricted) {
            if (
              !this._permissionService.haveRestrictedDocumentPermission(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                blApiRequest.user.id,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                blApiRequest.user.permission,
                doc,
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
          } else {
            //if (!this._permissionService.haveDocumentPermission(blApiRequest.user.permission, doc)) {
            //return Promise.reject(new BlError('lacking document permission to view or edit the document').code(904));
            //}
          }
        } else {
          let permissionValid = false;

          if (
            !this._permissionService.haveRestrictedDocumentPermission(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              blApiRequest.user.id,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              blApiRequest.user.permission,
              doc,
              restriction,
              documentPermission,
            )
          ) {
            for (const id of doc.viewableFor) {
              if (id.toString() === blApiRequest.user?.id.toString()) {
                permissionValid = true;
                break;
              }
            }
          } else {
            permissionValid = true;
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
