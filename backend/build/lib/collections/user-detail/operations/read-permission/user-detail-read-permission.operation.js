import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
export class UserDetailReadPermissionOperation {
    async run(blApiRequest) {
        const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);
        const users = await BlStorage.Users.aggregate([
            { $match: { blid: userDetail.blid } },
        ]);
        const user = users[0];
        // @ts-expect-error fixme: auto ignored
        return new BlapiResponse([{ permission: user.permission }]);
    }
}
