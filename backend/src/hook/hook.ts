import { BlDocument } from "@shared/bl-document/bl-document.js";
import { AccessToken } from "@shared/token/access-token.js";
import { ParsedQs } from "qs";

export class Hook {
  public before(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken?: AccessToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query?: ParsedQs,
  ): Promise<boolean | unknown> {
    return Promise.resolve(true);
  }

  after(
    docs: BlDocument[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken?: AccessToken,
  ): Promise<BlDocument[]> {
    return Promise.resolve(docs ? docs : []);
  }
}
