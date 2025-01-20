import generateBlIdPDF from "@backend/collections/unique-item/helpers/bl-id-generator.js";
import { Operation } from "@backend/operation/operation.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { Request, Response } from "express";

export class GenerateUniqueIdsOperation implements Operation {
  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    res.writeHead(200, {
      "Content-Type": "application/pdf",
    });

    res.end(await generateBlIdPDF());
    return true;
  }
}
