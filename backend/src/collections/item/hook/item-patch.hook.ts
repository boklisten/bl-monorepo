import { Item } from "@shared/item/item";
import { AccessToken } from "@shared/token/access-token";

export class ItemPatchHook {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line
  before(body: any, accessToken: AccessToken, id: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  after(items: Item[], accessToken: AccessToken): Promise<Item[]> {
    return Promise.resolve(items);
  }
}
