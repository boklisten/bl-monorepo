import "mocha";
import { DbQueryStringFilter } from "@backend/query/string-filter/db-query-string-filter.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQueryStringFilter", () => {
  const dbQueryStringFilter: DbQueryStringFilter = new DbQueryStringFilter();

  describe("getStringFilters()", () => {
    it("should return empty array if query is valid and validStringParams is empty", () => {
      expect(
        dbQueryStringFilter.getStringFilters({ name: "testerman" }, []),
      ).to.eql([]);
    });

    it("should throw TypeError if query is empty", () => {
      expect(() => {
        dbQueryStringFilter.getStringFilters({}, ["name"]);
      }).to.throw(TypeError);
    });

    it("should throw error when both query and validParams are empty ", () => {
      expect(() => {
        dbQueryStringFilter.getStringFilters({}, []);
      }).to.throw(TypeError);
    });

    it("should throw TypeError if parameter is not a valid string", () => {
      expect(() => {
        dbQueryStringFilter.getStringFilters({ name: { test: {} } }, ["name"]);
      }).to.throw(TypeError);
    });

    it("should not change values in query that are not in ValidStringParams", () => {
      const result = [{ fieldName: "name", value: "albert" }];
      expect(
        dbQueryStringFilter.getStringFilters({ name: "albert", phone: "123" }, [
          "name",
        ]),
      ).to.eql(result);
    });

    it("should return correct array given valid input", () => {
      const query = {
        name: "billy bob",
        desc: "hello there this is bob",
        age: "10",
        branch: ["123", "83ax"],
      };
      const result = [
        { fieldName: "name", value: "billy bob" },
        { fieldName: "desc", value: "hello there this is bob" },
        { fieldName: "branch", value: ["123", "83ax"] },
      ];

      expect(
        dbQueryStringFilter.getStringFilters(query, [
          "name",
          "desc",
          "title",
          "branch",
        ]),
      ).to.eql(result);
    });
  });
});
