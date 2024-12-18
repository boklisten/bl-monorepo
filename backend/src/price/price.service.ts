export class PriceService {
  private up: boolean;
  private down: boolean;

  constructor(config?: { roundUp?: boolean; roundDown?: boolean }) {
    this.up = config?.roundUp ?? false;
    this.down = config?.roundDown ?? false;
  }

  public sanitize(price: number): number {
    return +price.toFixed(2); // the plus changes the output to a number
  }

  public round(number_: number): number {
    if (this.up) {
      return this.roundUp(number_);
    } else if (this.down) {
      return this.roundDown(number_);
    } else {
      return number_;
    }
  }

  private roundDown(number_: number): number {
    return Number.parseInt((number_ / 10).toString(), 10) * 10;
  }

  private roundUp(number_: number): number {
    return Number.parseInt((number_ / 10).toString(), 10) * 10 + 10;
  }
}
