import { DbQueryOnlyGetFilter } from "@backend/express/query/db-query-only-get-filter.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryOnlyGetFilter", async () => {
  const dbQueryOnlyGetFilter: DbQueryOnlyGetFilter = new DbQueryOnlyGetFilter();

  test("should throw TypeError if query is null or empty", async () => {
    expect(() => {
      dbQueryOnlyGetFilter.getOnlyGetFilters({}, ["name"]);
    }).to.throw(TypeError);
  });

  test("should return empty array if validOnlyGetParams is empty", async () => {
    expect(dbQueryOnlyGetFilter.getOnlyGetFilters({ og: "name" }, [])).to.eql(
      [],
    );
  });

  test("should return array with correct onlyGet fields", async () => {
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

  test("should throw ReferenceError if a parameter in onlyGet is not in validOnlyGetParams", async () => {
    expect(() => {
      dbQueryOnlyGetFilter.getOnlyGetFilters({ og: "age" }, ["name"]);
    }).to.throw(ReferenceError);
  });
});
