export class BlApiError {
  msg?: string;
  code?: number;

  constructor(msg?: string, code?: number) {
    if (msg) {
      this.msg = msg;
    }

    if (code) {
      this.code = code;
    }
  }
}
