import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

export class UserDetailReadPermissionOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);

    const users = await BlStorage.Users.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    // @ts-expect-error fixme: auto ignored
    return new BlapiResponse([{ permission: user.permission }]);
  }
}
