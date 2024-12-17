import "mocha";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import { DbQueryNumberFilter } from "@backend/query/number-filter/db-query-number-filter";

describe("DbQueryNumberFilter", () => {
  const dbQueryNumberFilter: DbQueryNumberFilter = new DbQueryNumberFilter();

  describe("getNumberFilters()", () => {
    it("should throw error when no input is given", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters({}, []);
      }).to.throw(TypeError);
    });

    it("should return empty array when the ValidParams are empty", () => {
      expect(
        dbQueryNumberFilter.getNumberFilters(
          { title: "test title", name: "hello" },
          [],
        ),
      ).to.eql([]);
    });

    it("should throw error when query is null", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters(null, ["age"]);
      }).to.throw(TypeError);
    });

    it("should throw error when query is empty", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters({}, ["age"]);
      }).to.throw(TypeError);
    });

    it('should return array containing "{fieldName: "age", op: {$lt: 60}}"', () => {
      const result = [{ fieldName: "age", op: { $lt: 60 } }];

      expect(
        dbQueryNumberFilter.getNumberFilters({ age: "<60" }, ["age"]),
      ).to.eql(result);
    });

    it('should return array equal to [{filedName: "age", op: {$lt: 86, $gt: 12}}]', () => {
      const result = [{ fieldName: "age", op: { $lt: 86, $gt: 12 } }];

      expect(
        dbQueryNumberFilter.getNumberFilters({ age: ["<86", ">12"] }, ["age"]),
      ).to.eql(result);
    });

    it('should return array with {fieldName: "age", op: {$eq: 10}}', () => {
      const result = [{ fieldName: "age", op: { $eq: 10 } }];

      expect(
        dbQueryNumberFilter.getNumberFilters({ age: "10" }, ["age"]),
      ).to.eql(result);
    });

    it("should throw error when number is not valid", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters({ age: ">10>1" }, ["age"]);
      }).to.throw(TypeError);
    });

    it("should throw error when wrong input is given", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters({ price: "*10" }, ["price"]);
      }).to.throw(TypeError);
    });

    it("should throw error when combinding eq operator with lessThan operator", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters({ age: ["<40", "30"] }, ["age"]);
      }).to.throw(SyntaxError);
    });

    it("should throw error when combinding eq operator with greaterThan operator", () => {
      expect(() => {
        dbQueryNumberFilter.getNumberFilters({ age: [">40", "30"] }, ["age"]);
      }).to.throw(SyntaxError);
    });

    it("should return an empty array if none of the validNumberNumberParams are included in the query", () => {
      expect(
        dbQueryNumberFilter.getNumberFilters({ title: "test", name: "bill" }, [
          "age",
          "price",
        ]),
      ).to.eql([]);
    });
  });
});
