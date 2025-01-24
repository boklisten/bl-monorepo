import { OrderFieldValidator } from "@backend/lib/collections/order/helpers/order-validator/order-field-validator/order-field-validator.js";
import { OrderItemBuyValidator } from "@backend/lib/collections/order/helpers/order-validator/order-item-validator/order-item-buy-validator/order-item-buy-validator.js";
import { OrderItemExtendValidator } from "@backend/lib/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator.js";
import { OrderItemPartlyPaymentValidator } from "@backend/lib/collections/order/helpers/order-validator/order-item-validator/order-item-partly-payment-validator/order-item-partly-payment-validator.js";
import { OrderItemRentValidator } from "@backend/lib/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-validator.js";
import { isNotNullish } from "@backend/lib/helper/typescript-helpers.js";
import { PriceService } from "@backend/lib/price/price.service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderItemValidator {
    orderItemFieldValidator;
    orderItemExtendValidator;
    orderItemBuyValidator;
    orderItemRentValidator;
    orderItemPartlyPaymentValidator;
    priceService;
    constructor(orderItemFieldValidator, orderItemRentValidator, orderItemBuyValidator, orderItemExtendValidator, orderItemPartlyPaymentValidator) {
        this.orderItemFieldValidator =
            orderItemFieldValidator ?? new OrderFieldValidator();
        this.orderItemRentValidator =
            orderItemRentValidator ?? new OrderItemRentValidator();
        this.orderItemBuyValidator =
            orderItemBuyValidator ?? new OrderItemBuyValidator();
        this.orderItemExtendValidator =
            orderItemExtendValidator ?? new OrderItemExtendValidator();
        this.priceService = new PriceService({ roundDown: true });
        this.orderItemPartlyPaymentValidator =
            orderItemPartlyPaymentValidator ?? new OrderItemPartlyPaymentValidator();
    }
    async validate(branch, order, isAdmin) {
        try {
            if (!isAdmin) {
                this.validateDeadlines(order.orderItems ?? []);
            }
            await this.orderItemFieldValidator.validate(order);
            this.assertNoDuplicateOrderItems(order.orderItems);
            this.validateAmount(order);
            for (const orderItem of order.orderItems) {
                const item = await BlStorage.Items.get(orderItem.item);
                await this.validateOrderItemBasedOnType(branch, item, orderItem);
                this.validateOrderItemAmounts(orderItem);
            }
        }
        catch (error) {
            if (error instanceof BlError) {
                return Promise.reject(error);
            }
            return Promise.reject(new BlError("unknown error, orderItem could not be validated").store("error", error));
        }
        // @ts-expect-error fixme: auto ignored
        return undefined;
    }
    assertNoDuplicateOrderItems(orderItems) {
        const blids = orderItems
            .filter((orderItem) => isNotNullish(orderItem.blid) &&
            ["partly-payment", "rent"].includes(orderItem.type))
            .map((orderItem) => orderItem.blid);
        if (blids.length > 0 && blids.length !== new Set(blids).size)
            throw new BlError("order contains multiple of the same blid").code(814);
    }
    async validateOrderItemBasedOnType(branch, item, orderItem) {
        switch (orderItem.type) {
            case "rent": {
                return await this.orderItemRentValidator.validate(branch, orderItem, item);
            }
            case "partly-payment": {
                return await this.orderItemPartlyPaymentValidator.validate(orderItem, item, branch);
            }
            case "buy": {
                return await this.orderItemBuyValidator.validate(branch, orderItem, item);
            }
            case "extend": {
                return await this.orderItemExtendValidator.validate(branch, orderItem);
            }
        }
        // @ts-expect-error fixme: auto ignored
        return undefined;
    }
    validateOrderItemAmounts(orderItem) {
        const expectedTotalAmount = this.priceService.sanitize(orderItem.unitPrice + orderItem.taxAmount);
        if (orderItem.amount !== expectedTotalAmount) {
            throw new BlError(`orderItem.amount "${orderItem.amount}" is not equal to orderItem.unitPrice "${orderItem.unitPrice}" + orderItem.taxAmount "${orderItem.taxAmount}"`);
        }
        const expectedTaxAmount = this.priceService.sanitize(orderItem.unitPrice * orderItem.taxRate);
        if (orderItem.taxAmount !== expectedTaxAmount) {
            throw new BlError(`orderItem.taxAmount "${orderItem.taxAmount}" is not equal to orderItem.unitPrice "${orderItem.unitPrice}" * orderItem.taxRate "${orderItem.taxRate}"`);
        }
    }
    validateAmount(order) {
        let expectedTotalAmount = 0;
        for (const orderItem of order.orderItems) {
            expectedTotalAmount += orderItem.amount;
        }
        if (expectedTotalAmount !== order.amount) {
            throw new BlError(`order.amount is "${order.amount}" but total of orderItems amount is "${expectedTotalAmount}"`);
        }
        return true;
    }
    validateDeadlines(orderItems) {
        const now = new Date();
        const nowWithGracePeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10);
        const fourYearsFromNow = new Date(now.getFullYear() + 4, now.getMonth(), now.getDate());
        const hasExpiredDeadlines = orderItems.some((item) => {
            if (!item.info?.to) {
                return false;
            }
            const deadline = new Date(item.info.to);
            return nowWithGracePeriod > deadline;
        });
        const hasDeadlinesTooFarInTheFuture = orderItems.some((item) => {
            if (!item.info?.to) {
                return false;
            }
            const deadline = new Date(item.info.to);
            return deadline > fourYearsFromNow;
        });
        if (hasExpiredDeadlines) {
            throw new BlError("orderItem deadlines must be in the future").code(809);
        }
        if (hasDeadlinesTooFarInTheFuture) {
            throw new BlError("orderItem deadlines must less than two years into the future").code(810);
        }
    }
}
