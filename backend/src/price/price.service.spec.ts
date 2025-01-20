import "mocha";
import { PriceService } from "@backend/price/price.service.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("PriceService", () => {
  describe("round()", () => {
    context("when rounding down to nearest 10", () => {
      const priceService = new PriceService({ roundDown: true });

      it("should return 30 when given 33", () => {
        return expect(priceService.round(33)).to.eql(30);
      });

      it("should return 20 when given 28.4", () => {
        return expect(priceService.round(28.4)).to.eql(20);
      });
    });

    context("when rounding up to nearest 10", () => {
      const priceService = new PriceService({ roundUp: true });

      it("should return 40 when given 33", () => {
        return expect(priceService.round(33)).to.eql(40);
      });

      it("should return 30 when given 28.4", () => {
        return expect(priceService.round(28.4)).to.eql(30);
      });
    });
  });

  describe("#sanitize", () => {
    const priceService = new PriceService();

    it("should return 40.50 when input is 40.500000178", () => {
      return expect(priceService.sanitize(40.500000178)).to.eq(40.5);
    });

    it("should return 125.01 when input is 125.009", () => {
      return expect(priceService.sanitize(125.009)).to.eq(125.01);
    });
  });
});
