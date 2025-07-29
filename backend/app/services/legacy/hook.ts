import { JwtPayload } from "jsonwebtoken";
import { ParsedQs } from "qs";

import { BlDocument } from "#shared/bl-document";

export class Hook {
  public before(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken?: JwtPayload,
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
    accessToken?: JwtPayload,
  ): Promise<BlDocument[]> {
    return Promise.resolve(docs ? docs : []);
  }
}
