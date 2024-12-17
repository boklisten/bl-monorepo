import { BlapiResponse, BlError, CustomerItem } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { customerItemSchema } from "@/collections/customer-item/customer-item.schema";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export interface PublicBlidLookupSpec {
  blid: string;
}

export function verifyPublicBlidLookupSpec(
  publicBlidLookupSpec: unknown,
): publicBlidLookupSpec is PublicBlidLookupSpec {
  const m = publicBlidLookupSpec as Record<string, unknown> | null | undefined;
  return !!m && typeof m["blid"] === "string";
}

export class PublicBlidLookupOperation implements Operation {
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;

  constructor(customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this._customerItemStorage =
      customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const publicBlidLookupSpec = blApiRequest.data;
    if (!verifyPublicBlidLookupSpec(publicBlidLookupSpec)) {
      throw new BlError(`Malformed PublicBlidLookupSpec`).code(701);
    }

    const customerItemInfo = await this._customerItemStorage.aggregate([
      {
        $match: {
          returned: false,
          buyout: false,
          cancel: false,
          buyback: false,
          blid: publicBlidLookupSpec.blid,
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
