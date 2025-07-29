import { isNullish } from "#services/helper/typescript-helpers";
import { PermissionService } from "#services/permission_service";
import { BlStorageData } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import {
  BlDocumentPermission,
  BlEndpointRestriction,
} from "#services/types/bl-collection";
import { BlError } from "#shared/bl-error/bl-error";

function validate(
  restriction: BlEndpointRestriction | undefined,
  docs: BlStorageData,
  blApiRequest: BlApiRequest,
  documentPermission?: BlDocumentPermission,
) {
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
            !PermissionService.haveRestrictedDocumentPermission(
              // @ts-expect-error fixme: auto ignored
              blApiRequest.user.id,
              // @ts-expect-error fixme: auto ignored
              blApiRequest.user.permission,
              document_,
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
          PermissionService.haveRestrictedDocumentPermission(
            // @ts-expect-error fixme: auto ignored
            blApiRequest.user.id,
            // @ts-expect-error fixme: auto ignored
            blApiRequest.user.permission,
            document_,
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

const CollectionEndpointDocumentAuth = {
  validate,
};
export default CollectionEndpointDocumentAuth;
