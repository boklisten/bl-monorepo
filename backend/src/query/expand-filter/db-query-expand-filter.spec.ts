import "mocha";
import { DbQueryExpandFilter } from "@backend/query/expand-filter/db-query-expand-filter";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQueryExpandFilter", () => {
  const dbQueryExpandFilter = new DbQueryExpandFilter();

  it("should throw TypeError if query is empty or null", () => {
    expect(() => {
      dbQueryExpandFilter.getExpandFilters(null, ["aValue"]);
    }).to.throw(TypeError);
  });

  it('should return empty array if "expand" keyword is not found in query', () => {
    expect(
      dbQueryExpandFilter.getExpandFilters({ og: "customer" }, ["customer"]),
    ).to.eql([]);
  });

  it('should return empty array if "validQueryParams" is empty', () => {
    expect(
      dbQueryExpandFilter.getExpandFilters({ expand: "customer" }, []),
    ).to.eql([]);
  });

  it("should return array of expand field when present in query", () => {
    expect(
      dbQueryExpandFilter.getExpandFilters({ expand: "customer" }, [
        "customer",
      ]),
    ).to.eql([{ fieldName: "customer" }]);
  });

  it("should return array of expand fields when present in query", () => {
    expect(
      dbQueryExpandFilter.getExpandFilters({ expand: ["customer", "order"] }, [
        "customer",
        "order",
      ]),
    ).to.eql([{ fieldName: "customer" }, { fieldName: "order" }]);
  });
});
