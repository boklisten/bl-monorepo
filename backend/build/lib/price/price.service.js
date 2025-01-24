export class PriceService {
    up;
    down;
    constructor(config) {
        this.up = config?.roundUp ?? false;
        this.down = config?.roundDown ?? false;
    }
    sanitize(price) {
        return +price.toFixed(2); // the plus changes the output to a number
    }
    round(number_) {
        if (this.up) {
            return this.roundUp(number_);
        }
        else if (this.down) {
            return this.roundDown(number_);
        }
        else {
            return number_;
        }
    }
    roundDown(number_) {
        return Number.parseInt((number_ / 10).toString(), 10) * 10;
    }
    roundUp(number_) {
        return Number.parseInt((number_ / 10).toString(), 10) * 10 + 10;
    }
}
