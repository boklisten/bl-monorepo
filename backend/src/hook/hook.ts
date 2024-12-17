import { BlDocument, AccessToken } from "@boklisten/bl-model";

export class Hook {
  public before(
    _body?: unknown,
    _accessToken?: AccessToken,
    _id?: string,
    _query?: unknown,
  ): Promise<boolean | unknown> {
    return Promise.resolve(true);
  }

  public after(
    docs: BlDocument[],
    _accessToken?: AccessToken,
  ): Promise<BlDocument[]> {
    return Promise.resolve(docs ? docs : []);
  }
}
