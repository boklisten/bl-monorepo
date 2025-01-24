import { BlError } from "@shared/bl-error/bl-error.js";
export class ItemValidator {
    validateItemInOrder(item, orderItem) {
        if (item.id != orderItem.item) {
            throw new BlError('item.id "' +
                item.id +
                '" is not equal to orderItem.item "' +
                orderItem.item +
                '"');
        }
        if (!item.active) {
            throw new BlError("item.active is false and cannot be in a order");
        }
        return true;
    }
}
