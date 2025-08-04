import { ObjectId } from "mongodb";

import { BlStorage } from "#services/storage/bl-storage";
import { BlapiResponse } from "#shared/blapi-response";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

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
