import { BlApiError } from "@shared/bl-api-error/bl-api-error";

export class BlApiNotFoundError extends BlApiError {
  name?: string;
  path?: string;

  constructor(message?: string, code?: number, path?: string) {
    super(message, code);

    this.name = "BlApiNotFoundError";

    if (path) {
      this.path = path;
    }
  }
}
