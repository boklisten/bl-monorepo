import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";

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
