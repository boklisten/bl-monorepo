import { BlApiError } from "./bl-api-error";

export class BlApiNotFoundError extends BlApiError {
  name?: string;
  path?: string;

  constructor(msg?: string, code?: number, path?: string) {
    super(msg, code);

    this.name = "BlApiNotFoundError";

    if (path) {
      this.path = path;
    }
  }
}
