import { BlapiResponse } from "@boklisten/bl-model";
import { NextFunction, Request, Response } from "express";

import { BlApiRequest } from "@/request/bl-api-request";

export interface Operation {
  run(
    blApiRequest: BlApiRequest,
    req?: Request,
    res?: Response,
    next?: NextFunction,
  ): Promise<boolean | BlapiResponse>;
}
