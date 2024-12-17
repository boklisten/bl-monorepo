import "mocha";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQueryOnlyGetFilter } from "@/query/only-get-filter/db-query-only-get-filter";

chai.use(chaiAsPromised);

describe("DbQueryOnlyGetFilter", () => {
  describe("getOnlyGetFilters()", () => {
    const dbQueryOnlyGetFilter: DbQueryOnlyGetFilter =
      new DbQueryOnlyGetFilter();

    it("should throw TypeError if query is null or empty", () => {
      expect(() => {
        dbQueryOnlyGetFilter.getOnlyGetFilters({}, ["name"]);
      }).to.throw(TypeError);
    });

    it("should return empty array if validOnlyGetParams is empty", () => {
      expect(dbQueryOnlyGetFilter.getOnlyGetFilters({ og: "name" }, [])).to.eql(
        [],
      );
    });

    it("should return array with correct onlyGet fields", () => {
      const result = [
        { fieldName: "name", value: 1 },
        { fieldName: "age", value: 1 },
      ];

      expect(
        dbQueryOnlyGetFilter.getOnlyGetFilters({ og: ["name", "age"] }, [
          "name",
          "age",
          "desc",
        ]),
      ).to.eql(result);
    });

    it("should throw ReferenceError if a parameter in onlyGet is not in validOnlyGetParams", () => {
      expect(() => {
        dbQueryOnlyGetFilter.getOnlyGetFilters({ og: "age" }, ["name"]);
      }).to.throw(ReferenceError);
    });
  });
});
