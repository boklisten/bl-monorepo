import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { NextFunction, Request, Response } from "express";

export interface Operation {
  run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
    next?: NextFunction,
  ): Promise<boolean | BlapiResponse>;
}
