import { PriceService } from "@backend/lib/price/price.service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderItemBuyValidator {
    priceService;
    constructor(priceService) {
        this.priceService = priceService ?? new PriceService({ roundDown: true });
    }
    async validate(
    // @ts-expect-error fixme: auto ignored
    branch, orderItem, item) {
        try {
            this.validateOrderItemFields(orderItem, item);
            await this.validateOrderItemPriceTypeBuy(orderItem, item);
        }
        catch (error) {
            if (error instanceof BlError) {
                return Promise.reject(error);
            }
            return Promise.reject(new BlError("unknown error, could not validate price of orderItems, error: " +
                // @ts-expect-error fixme: auto ignored
                error.message).store("error", error));
        }
        return true;
    }
    validateOrderItemFields(orderItem, item) {
        if (orderItem.taxRate != item.taxRate) {
            throw new BlError(`orderItem.taxRate "${orderItem.taxRate}" is not equal to item.taxRate "${item.taxRate}"`);
        }
        const expectedTaxAmount = orderItem.amount * item.taxRate;
        if (orderItem.taxAmount != expectedTaxAmount) {
            throw new BlError(`orderItem.taxAmount "${orderItem.taxAmount}" is not equal to (orderItem.amount "${orderItem.amount}" * item.taxRate "${item.taxRate}") "${expectedTaxAmount}"`);
        }
        return true;
    }
    async validateIfMovedFromOrder(orderItem, itemPrice) {
        if (!orderItem.movedFromOrder) {
            return true;
        }
        await BlStorage.Orders.get(orderItem.movedFromOrder)
            .then((order) => {
            if ((!order.payments || order.payments.length <= 0) &&
                orderItem.amount === 0) {
                throw new BlError('the original order has not been payed, but orderItem.amount is "0"');
            }
            const movedFromOrderItem = this.getOrderItemFromOrder(orderItem.item, order);
            const expectedOrderItemAmount = this.priceService.round(this.priceService.sanitize(itemPrice)) -
                movedFromOrderItem.amount;
            if (orderItem.amount !== expectedOrderItemAmount) {
                throw new BlError(`orderItem amount is "${orderItem.amount}" but should be "${expectedOrderItemAmount}"`);
            }
            return true;
        })
            .catch(() => {
            return false;
        });
        // @ts-expect-error fixme: auto ignored
        return undefined;
    }
    getOrderItemFromOrder(itemId, order) {
        for (const orderItem of order.orderItems) {
            if (orderItem.item.toString() === itemId.toString()) {
                return orderItem;
            }
        }
        throw new BlError("not found in original orderItem");
    }
    async validateOrderItemPriceTypeBuy(orderItem, item) {
        let price;
        let discount = 0;
        if (orderItem.movedFromOrder !== undefined &&
            orderItem.movedFromOrder !== null) {
            return await this.validateIfMovedFromOrder(orderItem, item.price);
        }
        if (orderItem.discount) {
            if (!orderItem.discount.amount) {
                throw new BlError("orderItem.discount was set, but no discount.amount provided");
            }
            discount = orderItem.discount.amount;
            price = this.priceService.sanitize(item.price - orderItem.discount.amount);
        }
        else {
            price = this.priceService.sanitize(item.price);
        }
        const expectedPrice = this.priceService.round(price);
        if (orderItem.amount != expectedPrice) {
            throw new BlError(`orderItem.amount "${orderItem.amount}" is not equal to item.price "${item.price}" - orderItem.discount "${discount}" = "${expectedPrice}" when type is "buy"`);
        }
        return true;
    }
}
