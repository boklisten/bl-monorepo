import { BlApiError } from "./bl-api-error";

export class BlApiLoginRequiredError extends BlApiError {
  public name?: string;

  constructor(msg?: string, code?: number) {
    super(msg, code);
    this.name = "BlApiLoginRequiredError";
  }
}
