import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { NextFunction, Request, Response } from "express";

export interface Operation {
  run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
    next: NextFunction,
  ): Promise<boolean | BlapiResponse>;
}
