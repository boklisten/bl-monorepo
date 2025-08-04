import { StorageService } from "#services/storage_service";
import { BlapiResponse } from "#shared/blapi-response";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

export class UserDetailReadPermissionOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const userDetail = await StorageService.UserDetails.get(
      blApiRequest.documentId,
    );

    const users = await StorageService.Users.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    // @ts-expect-error fixme: auto ignored
    return new BlapiResponse([{ permission: user.permission }]);
  }
}
