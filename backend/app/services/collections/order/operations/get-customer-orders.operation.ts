import { ObjectId } from "mongodb";

import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

export class GetCustomerOrdersOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const customerOrders = await BlStorage.Orders.aggregate([
      {
        $match: {
          customer: new ObjectId(blApiRequest.documentId),
          placed: true,
          byCustomer: true,
        },
      },
    ]);

    return new BlapiResponse([customerOrders]);
  }
}
