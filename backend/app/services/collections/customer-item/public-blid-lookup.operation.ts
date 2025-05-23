import { z } from "zod";
import { fromError } from "zod-validation-error";

import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

const PublicBlidLookupSpec = z.object({
  blid: z.string(),
});

export class PublicBlidLookupOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = PublicBlidLookupSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }

    const customerItemInfo = await BlStorage.CustomerItems.aggregate([
      {
        $match: {
          returned: false,
          buyout: false,
          cancel: false,
          buyback: false,
          blid: parsedRequest.data.blid,
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "handoutInfo.handoutById",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "item",
          foreignField: "_id",
          as: "itemInfo",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $project: {
          handoutBranch: { $first: "$branchInfo.name" },
          handoutTime: "$handoutInfo.time",
          deadline: 1,
          title: { $first: "$itemInfo.title" },
          isbn: { $toString: { $first: "$itemInfo.info.isbn" } },
          name: { $first: "$customerInfo.name" },
          email: { $first: "$customerInfo.email" },
          phone: { $first: "$customerInfo.phone" },
        },
      },
    ]);

    return new BlapiResponse(customerItemInfo);
  }
}
