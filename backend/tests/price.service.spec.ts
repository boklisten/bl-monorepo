import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { PriceService } from "#services/legacy/price.service";

chaiUse(chaiAsPromised);
should();

test.group("PriceService", async () => {
  test("should return 30 when given 33", async () => {
    const priceService = new PriceService({ roundDown: true });
    expect(priceService.round(33)).to.eql(30);
  });

  test("should return 20 when given 28.4", async () => {
    const priceService = new PriceService({ roundDown: true });
    expect(priceService.round(28.4)).to.eql(20);
  });

  test("should return 40 when given 33", async () => {
    const priceService = new PriceService({ roundUp: true });
    expect(priceService.round(33)).to.eql(40);
  });

  test("should return 30 when given 28.4", async () => {
    const priceService = new PriceService({ roundUp: true });
    expect(priceService.round(28.4)).to.eql(30);
  });

  test("should return 40.50 when input is 40.500000178", async () => {
    const priceService = new PriceService();
    expect(priceService.sanitize(40.500000178)).to.eq(40.5);
  });

  test("should return 125.01 when input is 125.009", async () => {
    const priceService = new PriceService();
    expect(priceService.sanitize(125.009)).to.eq(125.01);
  });
});
