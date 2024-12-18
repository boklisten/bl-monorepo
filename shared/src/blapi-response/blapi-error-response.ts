export class BlapiErrorResponse {
  httpStatus: number;
  code: number | undefined;
  msg: string | undefined;
  data: unknown;

  constructor(
    httpStatus: number,
    code?: number,
    message?: string,
    data?: unknown,
  ) {
    this.httpStatus = httpStatus;
    this.code = code;
    this.msg = message;
    this.data = data;
  }
}
