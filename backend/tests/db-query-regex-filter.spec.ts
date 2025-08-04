import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQueryRegexFilter } from "#services/legacy/query/db-query-regex-filter";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryRegexFilter", async () => {
  const dbQueryRegexFilter: DbQueryRegexFilter = new DbQueryRegexFilter();

  test("should return empty array when searchString is empty", async () => {
    expect(dbQueryRegexFilter.getRegexFilters({ name: "hello" }, [])).to.eql(
      [],
    );
  });

  test("should throw TypeError when search fieldName is under 3 characters long", async () => {
    expect(() => {
      dbQueryRegexFilter.getRegexFilters({ s: "si" }, ["name"]);
    }).to.throw(TypeError);
  });

  test("should return empty array when validSearchParams is empty", async () => {
    expect(dbQueryRegexFilter.getRegexFilters({ s: "hello" }, [])).to.eql([]);
  });

  test('should return array like [{name: {$regex: "sig", $options: "imx"}}]', async () => {
    const result = [
      { fieldName: "name", op: { $regex: "sig", $options: "imx" } },
    ];
    expect(dbQueryRegexFilter.getRegexFilters({ s: "sig" }, ["name"])).to.eql(
      result,
    );
  });

  test("should return array containing regexfilter objects for all params in validRegexParams", async () => {
    const result = [
      { fieldName: "name", op: { $regex: "hello", $options: "imx" } },
      { fieldName: "message", op: { $regex: "hello", $options: "imx" } },
      { fieldName: "info", op: { $regex: "hello", $options: "imx" } },
      { fieldName: "desc", op: { $regex: "hello", $options: "imx" } },
    ];

    const validRegexParams = ["name", "message", "info", "desc"];
    const query = { s: "hello" };

    expect(dbQueryRegexFilter.getRegexFilters(query, validRegexParams)).to.eql(
      result,
    );
  });
});
