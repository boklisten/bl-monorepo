import { CustomerItemActive } from "@backend/collections/customer-item/helpers/customer-item-active.js";
import { CustomerItem } from "@shared/customer-item/customer-item.js";
import { expect } from "chai";

describe("CustomerItemActive", () => {
  describe("isActive()", () => {
    const customerItemActive = new CustomerItemActive();

    it("should resolve false if customerItem.returned is set to true", () => {
      const customerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: true,
        buyout: false,
      };

      return expect(customerItemActive.isActive(customerItem)).false;
    });

    it("should resolve false if customerItem.buyout is set to true", () => {
      const customerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: false,
        buyout: true,
      };

      return expect(customerItemActive.isActive(customerItem)).false;
    });

    it("should resolve false if customerItem.cancel is set to true", () => {
      const customerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: false,
        buyout: false,
        cancel: true,
      };

      return expect(customerItemActive.isActive(customerItem)).false;
    });

    it("should resolve false if customerItem.buyback is set to true", () => {
      const customerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: false,
        buyout: false,
        cancel: false,
        buyback: true,
      };

      return expect(customerItemActive.isActive(customerItem)).false;
    });

    it("should resolve true if customerItem is active", () => {
      const customerItem: CustomerItem = {
        id: "customerItem1",
        item: "item1",
        blid: "blid1",
        customer: "customer1",
        deadline: new Date(),
        handout: true,
        returned: false,
        buyout: false,
      };

      return expect(customerItemActive.isActive(customerItem)).true;
    });
  });
});
