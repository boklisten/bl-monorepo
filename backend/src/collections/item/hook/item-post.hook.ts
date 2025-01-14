import { Hook } from "@backend/hook/hook";
import { Item } from "@shared/item/item";
import { AccessToken } from "@shared/token/access-token";

export class ItemPostHook extends Hook {
  public override before(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body: Item,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  public override after(
    items: Item[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: AccessToken,
  ): Promise<Item[]> {
    return Promise.resolve(items);
  }
}
