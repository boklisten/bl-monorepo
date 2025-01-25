import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import {
  DbQueryValidParams,
  ValidParameter,
} from "#services/query/db-query-valid-params";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryValidParams", async () => {
  test("should return empty array if no valid NumberParams is set", async () => {
    const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams([]);
    expect(dbQueryValidParams.getValidNumberParams()).to.eql([]);
  });

  test('should return array like ["name", "desc"] ', async () => {
    const validParams: ValidParameter[] = [];
    validParams.push({ fieldName: "age", type: "number" });
    validParams.push({ fieldName: "price", type: "number" });
    const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams(
      validParams,
    );
    const result = ["age", "price"];

    expect(dbQueryValidParams.getValidNumberParams()).to.eql(result);
  });

  test("should return empty array if none of the validParams are of type number", async () => {
    const validParams: ValidParameter[] = [
      { fieldName: "name", type: "string" },
    ];
    const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams(
      validParams,
    );
    expect(dbQueryValidParams.getValidNumberParams()).to.eql([]);
  });

  test("should return string array with names of all validParams with type string", async () => {
    const validParams: ValidParameter[] = [
      { fieldName: "name", type: "string" },
      { fieldName: "desc", type: "string" },
    ];
    const dbQuertyValidParams: DbQueryValidParams = new DbQueryValidParams(
      validParams,
    );
    const result = ["name", "desc"];

    expect(dbQuertyValidParams.getValidStringParams()).to.eql(result);
  });

  test('should return empty array if no validParams with type "string" is given', async () => {
    const validParams: ValidParameter[] = [
      { fieldName: "age", type: "number" },
    ];

    const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams(
      validParams,
    );

    expect(dbQueryValidParams.getValidStringParams()).to.eql([]);
  });
});
