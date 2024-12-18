export class BlApiError {
  msg?: string;
  code?: number;

  constructor(message?: string, code?: number) {
    if (message) {
      this.msg = message;
    }

    if (code) {
      this.code = code;
    }
  }
}
