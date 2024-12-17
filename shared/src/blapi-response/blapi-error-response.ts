export class BlapiErrorResponse {
  httpStatus: number;
  code: number | undefined;
  msg: string | undefined;
  data: any;

  constructor(httpStatus: number, code?: number, msg?: string, data?: any) {
    this.httpStatus = httpStatus;
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
}
