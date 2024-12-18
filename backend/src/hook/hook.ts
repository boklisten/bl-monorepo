import { BlDocument } from "@shared/bl-document/bl-document";
import { AccessToken } from "@shared/token/access-token";

export class Hook {
  public before(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _body?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accessToken?: AccessToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _query?: unknown,
  ): Promise<boolean | unknown> {
    return Promise.resolve(true);
  }

  public after(
    docs: BlDocument[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accessToken?: AccessToken,
  ): Promise<BlDocument[]> {
    return Promise.resolve(docs ? docs : []);
  }
}
