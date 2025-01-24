export class DibsEasyOrder {
    order;
    // @ts-expect-error fixme: auto ignored
    checkout;
    constructor() {
        this.order = {
            reference: "",
            items: [],
            amount: 0,
            currency: "NOK",
        };
    }
}
