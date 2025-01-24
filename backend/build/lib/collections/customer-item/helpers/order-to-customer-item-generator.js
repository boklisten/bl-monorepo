import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export class OrderToCustomerItemGenerator {
    async generate(order) {
        const customerItems = [];
        if (!order.customer) {
            return [];
        }
        const customerDetail = await BlStorage.UserDetails.get(order.customer);
        for (const orderItem of order.orderItems) {
            if (this.shouldCreateCustomerItem(orderItem)) {
                const customerItem = this.convertOrderItemToCustomerItem(customerDetail, order, orderItem);
                customerItem.viewableFor = [customerDetail?.blid ?? ""];
                customerItems.push(customerItem);
            }
        }
        return customerItems;
    }
    shouldCreateCustomerItem(orderItem) {
        return (orderItem.type === "partly-payment" ||
            orderItem.type === "rent" ||
            orderItem.type === "loan" ||
            orderItem.type === "match-receive");
    }
    convertOrderItemToCustomerItem(customerDetail, order, orderItem) {
        switch (orderItem.type) {
            case "partly-payment": {
                return this.createPartlyPaymentCustomerItem(customerDetail, order, orderItem);
            }
            case "rent":
            case "match-receive": {
                return this.createRentCustomerItem(customerDetail, order, orderItem);
            }
            case "loan": {
                return this.createLoanCustomerItem(customerDetail, order, orderItem);
            }
            // No default
        }
        throw new Error(`orderItem type "${orderItem.type}" is not supported`);
    }
    createPartlyPaymentCustomerItem(customerDetail, order, orderItem) {
        return {
            // @ts-expect-error fixme: auto ignored
            id: null,
            type: "partly-payment",
            item: orderItem.item,
            blid: orderItem.blid,
            customer: order.customer,
            // @ts-expect-error fixme: auto ignored
            deadline: orderItem.info.to,
            handout: true,
            // @ts-expect-error fixme: auto ignored
            handoutInfo: this.createHandoutInfo(order),
            returned: false,
            // @ts-expect-error fixme: auto ignored
            amountLeftToPay: orderItem["info"]["amountLeftToPay"],
            totalAmount: orderItem.amount,
            orders: [order.id],
            // @ts-expect-error fixme: auto ignored
            customerInfo: this.createCustomerInfo(customerDetail),
        };
    }
    createRentCustomerItem(customerDetail, order, orderItem) {
        return {
            // @ts-expect-error fixme: auto ignored
            id: null,
            type: "rent",
            item: orderItem.item,
            blid: orderItem.blid,
            customer: order.customer,
            // @ts-expect-error fixme: auto ignored
            deadline: orderItem.info.to,
            handout: true,
            // @ts-expect-error fixme: auto ignored
            handoutInfo: this.createHandoutInfo(order),
            returned: false,
            totalAmount: orderItem.amount,
            orders: [order.id],
            // @ts-expect-error fixme: auto ignored
            customerInfo: this.createCustomerInfo(customerDetail),
        };
    }
    createLoanCustomerItem(customerDetail, order, orderItem) {
        return {
            // @ts-expect-error fixme: auto ignored
            id: null,
            type: "loan",
            item: orderItem.item,
            blid: orderItem.blid,
            customer: order.customer,
            // @ts-expect-error fixme: auto ignored
            deadline: orderItem.info.to,
            handout: true,
            // @ts-expect-error fixme: auto ignored
            handoutInfo: this.createHandoutInfo(order),
            returned: false,
            totalAmount: orderItem.amount,
            orders: [order.id],
            // @ts-expect-error fixme: auto ignored
            customerInfo: this.createCustomerInfo(customerDetail),
        };
    }
    createHandoutInfo(order) {
        return {
            handoutBy: "branch",
            handoutById: order.branch,
            handoutEmployee: order.employee,
            time: order.creationTime,
        };
    }
    createCustomerInfo(customerDetail) {
        return {
            name: customerDetail.name,
            phone: customerDetail.phone,
            address: customerDetail.address,
            postCode: customerDetail.postCode,
            postCity: customerDetail.postCity,
            dob: customerDetail.dob,
            guardian: customerDetail.guardian,
        };
    }
}
