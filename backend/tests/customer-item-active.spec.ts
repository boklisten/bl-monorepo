import { test } from "@japa/runner";
import { expect } from "chai";

import { CustomerItemActive } from "#services/collections/customer-item/helpers/customer-item-active";
import { CustomerItem } from "#shared/customer-item/customer-item";

test.group("CustomerItemActive", async () => {
  const customerItemActive = new CustomerItemActive();

  test("should resolve false if customerItem.returned is set to true", async () => {
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

    expect(customerItemActive.isActive(customerItem)).false;
  });

  test("should resolve false if customerItem.buyout is set to true", async () => {
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

    expect(customerItemActive.isActive(customerItem)).false;
  });

  test("should resolve false if customerItem.cancel is set to true", async () => {
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

    expect(customerItemActive.isActive(customerItem)).false;
  });

  test("should resolve false if customerItem.buyback is set to true", async () => {
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

    expect(customerItemActive.isActive(customerItem)).false;
  });

  test("should resolve true if customerItem is active", async () => {
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

    expect(customerItemActive.isActive(customerItem)).true;
  });
});
