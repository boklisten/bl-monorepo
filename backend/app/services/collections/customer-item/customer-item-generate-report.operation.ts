import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { fromError } from "zod-validation-error";

import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";

const CustomerItemGenerateReportSpec = z.object({
  branchFilter: z.string().array().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  returned: z.boolean(),
  buyout: z.boolean(),
});

export class CustomerItemGenerateReportOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = CustomerItemGenerateReportSpec.safeParse(
      blApiRequest.data,
    );
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    const filterByHandoutBranchIfPresent = parsedRequest.data.branchFilter
      ? {
          "handoutInfo.handoutById": {
            $in: parsedRequest.data.branchFilter.map((id) => new ObjectId(id)),
          },
        }
      : {};

    const creationTimeLimiter: Record<string, Date> = {};
    if (parsedRequest.data.createdAfter) {
      creationTimeLimiter["$gte"] = new Date(parsedRequest.data.createdAfter);
    }
    if (parsedRequest.data.createdBefore) {
      creationTimeLimiter["$lte"] = new Date(parsedRequest.data.createdBefore);
    }
    const creationTimeFilter =
      Object.keys(creationTimeLimiter).length > 0
        ? { creationTime: creationTimeLimiter }
        : {};

    const reportData = await BlStorage.CustomerItems.aggregate([
      {
        $match: {
          returned: parsedRequest.data.returned,
          buyout: parsedRequest.data.buyout,
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
