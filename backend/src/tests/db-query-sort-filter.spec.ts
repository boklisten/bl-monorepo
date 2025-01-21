import "mocha";
import { DbQuerySortFilter } from "@backend/query/db-query-sort-filter.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQuerySortFilter", () => {
  describe("getSortFilter()", () => {
    const dbQuerySortFilter: DbQuerySortFilter = new DbQuerySortFilter();

    it("should throw TypeError when query is null or empty", () => {
      expect(() => {
        dbQuerySortFilter.getSortFilters({}, ["hello"]);
      }).to.throw(TypeError);
    });

    it("should return empty array if query does not have the sort object", () => {
      expect(
        dbQuerySortFilter.getSortFilters({ name: "hello" }, ["age"]),
      ).to.eql([]);
    });

    it("should throw ReferenceError if none of the sort params are in the ValidSortParams", () => {
      expect(() => {
        dbQuerySortFilter.getSortFilters({ sort: ["-age", "name"] }, ["desc"]);
      }).to.throw(ReferenceError);
    });

    it("should return correct array with the given input", () => {
      const result = [
        { fieldName: "name", direction: 1 },
        { fieldName: "age", direction: -1 },
      ];

      expect(
        dbQuerySortFilter.getSortFilters({ sort: ["name", "-age"] }, [
          "name",
          "age",
        ]),
      ).to.eql(result);
    });
  });
});
