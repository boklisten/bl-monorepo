import generateBlIdPDF from "@backend/collections/unique-item/helpers/bl-id-generator";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { Request, Response } from "express";

export class GenerateUniqueIdsOperation implements Operation {
  constructor(private resHandler?: SEResponseHandler) {
    this.resHandler ??= new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    res.writeHead(200, {
      "Content-Type": "application/pdf",
    });

    // @ts-expect-error fixme: auto ignored
    res.end(await generateBlIdPDF());
    return true;
  }
}
