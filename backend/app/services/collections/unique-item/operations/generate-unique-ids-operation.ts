import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

import { Operation } from "#services/types/operation";

export class GenerateUniqueIdsOperation implements Operation {
  async run() {
    /*
    fixme: reimplement when needed
    res.writeHead(200, {
      "Content-Type": "application/pdf",
    });

    res.end(await generateBlIdPDF());
     */
    return new BlapiResponse(["not implemented"]);
  }
}
