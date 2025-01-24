export class CustomerItemActive {
    isActive(customerItem) {
        return !(customerItem.returned ||
            customerItem.buyout ||
            customerItem.cancel ||
            customerItem.buyback);
    }
}
