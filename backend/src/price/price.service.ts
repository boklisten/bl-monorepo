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

  public round(num: number): number {
    if (this.up) {
      return this.roundUp(num);
    } else if (this.down) {
      return this.roundDown(num);
    } else {
      return num;
    }
  }

  private roundDown(num: number): number {
    return parseInt((num / 10).toString(), 10) * 10;
  }

  private roundUp(num: number): number {
    return parseInt((num / 10).toString(), 10) * 10 + 10;
  }
}
