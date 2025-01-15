import { ItemModel } from "@backend/collections/item/item.model";
import { UniqueItemModel } from "@backend/collections/unique-item/unique-item.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { addDetailsToUserMatches } from "@backend/collections/user-match/operations/user-match-getall-me-operation-helper";
import { UserMatchModel } from "@backend/collections/user-match/user-match.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorage } from "@backend/storage/blStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserMatch } from "@shared/match/user-match";
import { ObjectId } from "mongodb";

export class GetMyUserMatchesOperation implements Operation {
  private userDetailStorage = new BlStorage(UserDetailModel);
  private userMatchStorage = new BlStorage(UserMatchModel);
  private uniqueItemStorage = new BlStorage(UniqueItemModel);
  private itemStorage = new BlStorage(ItemModel);

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const customer = blApiRequest.user?.details ?? "";
    const userMatches = (await this.userMatchStorage.aggregate([
      {
        $match: {
          $or: [
            { customerA: new ObjectId(customer) },
            { customerB: new ObjectId(customer) },
          ],
        },
      },
    ])) as UserMatch[];

    if (userMatches.length === 0) {
      return new BlapiResponse([]);
    }

    const matchesWithDetails = await addDetailsToUserMatches(
      userMatches,
      this.userDetailStorage,
      this.itemStorage,
      this.uniqueItemStorage,
    );

    return new BlapiResponse(matchesWithDetails);
  }
}
