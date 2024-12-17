import { Order } from "@shared/order/order";

export class BranchValidator {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validate(order: Order): Promise<boolean> {
    return Promise.resolve(true);
  }
}
