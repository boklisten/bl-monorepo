import "mocha";
import { DbQueryLimitFilter } from "@backend/query/limit-filter/db-query-limit-filter.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQueryLimitFilter", () => {
  describe("getLimitFilter()", () => {
    const dbQueryLimitFilter = new DbQueryLimitFilter();

    it("should throw error if query is empty or null", () => {
      expect(() => {
        dbQueryLimitFilter.getLimitFilter({});
      }).to.throw(TypeError);
    });

    it("should return {limit: 0} if no limit is found in query", () => {
      expect(dbQueryLimitFilter.getLimitFilter({ name: "Albert" })).to.eql({
        limit: 0,
      });
    });

    it("should throw TypeError if limit is not a valid number", () => {
      expect(() => {
        dbQueryLimitFilter.getLimitFilter({ limit: "not a number" });
      }).to.throw(TypeError);
    });
  });
});
