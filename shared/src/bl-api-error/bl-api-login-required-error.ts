import { BlApiError } from "@shared/bl-api-error/bl-api-error";

export class BlApiLoginRequiredError extends BlApiError {
  public name?: string;

  constructor(message?: string, code?: number) {
    super(message, code);
    this.name = "BlApiLoginRequiredError";
  }
}
