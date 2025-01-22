import { DbQuerySortFilter } from "@backend/express/query/db-query-sort-filter.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("DbQuerySortFilter", async () => {
  const dbQuerySortFilter: DbQuerySortFilter = new DbQuerySortFilter();

  test("should throw TypeError when query is null or empty", async () => {
    expect(() => {
      dbQuerySortFilter.getSortFilters({}, ["hello"]);
    }).to.throw(TypeError);
  });

  test("should return empty array if query does not have the sort object", async () => {
    expect(dbQuerySortFilter.getSortFilters({ name: "hello" }, ["age"])).to.eql(
      [],
    );
  });

  test("should throw ReferenceError if none of the sort params are in the ValidSortParams", async () => {
    expect(() => {
      dbQuerySortFilter.getSortFilters({ sort: ["-age", "name"] }, ["desc"]);
    }).to.throw(ReferenceError);
  });

  test("should return correct array with the given input", async () => {
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
