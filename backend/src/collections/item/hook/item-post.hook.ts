import { AccessToken, Item } from "@boklisten/bl-model";

import { Hook } from "@/hook/hook";

export class ItemPostHook extends Hook {
  public override before(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body: Item,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  public override after(
    items: Item[],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
  ): Promise<Item[]> {
    return Promise.resolve(items);
  }
}
