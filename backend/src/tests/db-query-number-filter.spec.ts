import { DbQueryNumberFilter } from "@backend/express/query/db-query-number-filter.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryNumberFilter", async () => {
  const dbQueryNumberFilter: DbQueryNumberFilter = new DbQueryNumberFilter();

  test("should throw error when no input is given", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters({}, []);
    }).to.throw(TypeError);
  });

  test("should return empty array when the ValidParams are empty", async () => {
    expect(
      dbQueryNumberFilter.getNumberFilters(
        { title: "test title", name: "hello" },
        [],
      ),
    ).to.eql([]);
  });

  test("should throw error when query is null", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters(null, ["age"]);
    }).to.throw(TypeError);
  });

  test("should throw error when query is empty", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters({}, ["age"]);
    }).to.throw(TypeError);
  });

  test('should return array containing "{fieldName: "age", op: {$lt: 60}}"', async () => {
    const result = [{ fieldName: "age", op: { $lt: 60 } }];

    expect(
      dbQueryNumberFilter.getNumberFilters({ age: "<60" }, ["age"]),
    ).to.eql(result);
  });

  test('should return array equal to [{filedName: "age", op: {$lt: 86, $gt: 12}}]', async () => {
    const result = [{ fieldName: "age", op: { $lt: 86, $gt: 12 } }];

    expect(
      dbQueryNumberFilter.getNumberFilters({ age: ["<86", ">12"] }, ["age"]),
    ).to.eql(result);
  });

  test('should return array with {fieldName: "age", op: {$eq: 10}}', async () => {
    const result = [{ fieldName: "age", op: { $eq: 10 } }];

    expect(dbQueryNumberFilter.getNumberFilters({ age: "10" }, ["age"])).to.eql(
      result,
    );
  });

  test("should throw error when number is not valid", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters({ age: ">10>1" }, ["age"]);
    }).to.throw(TypeError);
  });

  test("should throw error when wrong input is given", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters({ price: "*10" }, ["price"]);
    }).to.throw(TypeError);
  });

  test("should throw error when combinding eq operator with lessThan operator", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters({ age: ["<40", "30"] }, ["age"]);
    }).to.throw(SyntaxError);
  });

  test("should throw error when combinding eq operator with greaterThan operator", async () => {
    expect(() => {
      dbQueryNumberFilter.getNumberFilters({ age: [">40", "30"] }, ["age"]);
    }).to.throw(SyntaxError);
  });

  test("should return an empty array if none of the validNumberNumberParams are included in the query", async () => {
    expect(
      dbQueryNumberFilter.getNumberFilters({ title: "test", name: "bill" }, [
        "age",
        "price",
      ]),
    ).to.eql([]);
  });
});
