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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    blApiRequest: BlApiRequest,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    res.writeHead(200, {
      "Content-Type": "application/pdf",
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    res.end(await generateBlIdPDF());
    return true;
  }
}
