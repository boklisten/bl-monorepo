import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { isBoolean, isNullish } from "@backend/helper/typescript-helpers";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { ObjectId } from "mongodb";

export interface CustomerItemGenerateReportSpec {
  branchFilter?: string[];
  createdAfter?: string;
  createdBefore?: string;
  returned: boolean;
  buyout: boolean;
}

export function verifyCustomerItemGenerateReportSpec(
  customerItemGenerateReportSpec: unknown,
): customerItemGenerateReportSpec is CustomerItemGenerateReportSpec {
  const m = customerItemGenerateReportSpec as
    | Record<string, unknown>
    | null
    | undefined;
  return (
    !!m &&
    isBoolean(m["returned"]) &&
    isBoolean(m["buyout"]) &&
    (isNullish(m["branchFilter"]) ||
      (Array.isArray(m["branchFilter"]) &&
        m["branchFilter"].every((branchId) => ObjectId.isValid(branchId)))) &&
    (isNullish(m["createdAfter"]) ||
      (typeof m["createdAfter"] === "string" &&
        !isNaN(new Date(m["createdAfter"]).getTime()))) &&
    (isNullish(m["createdBefore"]) ||
      (typeof m["createdBefore"] === "string" &&
        !isNaN(new Date(m["createdBefore"]).getTime())))
  );
}

export class CustomerItemGenerateReportOperation implements Operation {
  private readonly _customerItemStorage: BlDocumentStorage<CustomerItem>;

  constructor(customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this._customerItemStorage =
      customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const customerItemGenerateReportSpec = blApiRequest.data;
    if (!verifyCustomerItemGenerateReportSpec(customerItemGenerateReportSpec)) {
      throw new BlError(`Malformed CustomerItemGenerateReportSpec`).code(701);
    }
    const filterByHandoutBranchIfPresent =
      customerItemGenerateReportSpec.branchFilter
        ? {
            "handoutInfo.handoutById": {
              $in: customerItemGenerateReportSpec.branchFilter.map(
                (id) => new ObjectId(id),
              ),
            },
          }
        : {};

    const creationTimeLimiter: Record<string, Date> = {};
    if (customerItemGenerateReportSpec.createdAfter) {
      creationTimeLimiter["$gte"] = new Date(
        customerItemGenerateReportSpec.createdAfter,
      );
    }
    if (customerItemGenerateReportSpec.createdBefore) {
      creationTimeLimiter["$lte"] = new Date(
        customerItemGenerateReportSpec.createdBefore,
      );
    }
    const creationTimeFilter =
      Object.keys(creationTimeLimiter).length > 0
        ? { creationTime: creationTimeLimiter }
        : {};

    const reportData = await this._customerItemStorage.aggregate([
      {
        $match: {
          returned: customerItemGenerateReportSpec.returned,
          buyout: customerItemGenerateReportSpec.buyout,
          ...filterByHandoutBranchIfPresent,
          ...creationTimeFilter,
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
        $addFields: {
          customer: {
            $toObjectId: "$customer",
          },
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
        $lookup: {
          from: "userdetails",
          localField: "handoutInfo.handoutEmployee",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      {
        $project: {
          handoutBranch: { $first: "$branchInfo.name" },
          handoutTime: "$handoutInfo.time",
          lastUpdated: 1,
          deadline: 1,
          blid: 1,
          title: { $first: "$itemInfo.title" },
          isbn: { $toString: { $first: "$itemInfo.info.isbn" } },
          name: { $first: "$customerInfo.name" },
          email: { $first: "$customerInfo.email" },
          phone: { $first: "$customerInfo.phone" },
          dob: { $first: "$customerInfo.dob" },
          guardianEmail: { $first: "$customerInfo.guardian.email" },
          guardianPhone: { $first: "$customerInfo.guardian.phone" },
          guardianName: { $first: "$customerInfo.guardian.name" },
          handoutEmployee: { $first: "$employeeInfo.name" },
          pivot: "1",
        },
      },
    ]);

    return new BlapiResponse(reportData);
  }
}
