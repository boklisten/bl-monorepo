import "mocha";
import { DbQuerySkipFilter } from "@backend/query/skip-filter/db-query-skip-filter";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQuerySkipFilter", () => {
  describe("getSkipFilter()", () => {
    const dbQuerySkipFilter: DbQuerySkipFilter = new DbQuerySkipFilter();

    it("should throw TypeError if query is null or empty", () => {
      expect(() => {
        dbQuerySkipFilter.getSkipFilter({});
      }).to.throw(TypeError);
    });

    it("should return {skip: 0} when no skip parameter is in query", () => {
      expect(dbQuerySkipFilter.getSkipFilter({ name: "hello" })).to.eql({
        skip: 0,
      });
    });

    it("should throw TypeError when skip is not a number", () => {
      expect(() => {
        dbQuerySkipFilter.getSkipFilter({ skip: "hello" });
      }).to.throw(TypeError);
    });

    it("should throw TypeError if number is below 0", () => {
      expect(() => {
        dbQuerySkipFilter.getSkipFilter({ skip: "-1" });
      }).to.throw(TypeError);
    });

    it('should return skip 5 when query is {skip: "5"}', () => {
      expect(dbQuerySkipFilter.getSkipFilter({ skip: "5" })).to.eql({
        skip: 5,
      });
    });
  });
});
