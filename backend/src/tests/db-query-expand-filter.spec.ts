import { DbQueryExpandFilter } from "@backend/query/db-query-expand-filter.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQueryExpandFilter", () => {
  const dbQueryExpandFilter = new DbQueryExpandFilter();

  it("should throw TypeError if query is empty or null", () => {
    expect(() => {
      dbQueryExpandFilter.getExpandFilters(null);
    }).to.throw(TypeError);
  });

  it('should return empty array if "expand" keyword is not found in query', () => {
    expect(dbQueryExpandFilter.getExpandFilters({ og: "customer" })).to.eql([]);
  });

  it("should return array of expand field when present in query", () => {
    expect(dbQueryExpandFilter.getExpandFilters({ expand: "customer" })).to.eql(
      [{ fieldName: "customer" }],
    );
  });

  it("should return array of expand fields when present in query", () => {
    expect(
      dbQueryExpandFilter.getExpandFilters({ expand: ["customer", "order"] }),
    ).to.eql([{ fieldName: "customer" }, { fieldName: "order" }]);
  });
});
