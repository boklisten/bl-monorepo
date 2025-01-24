import { SEDbQuery } from "@backend/lib/query/se.db-query.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("SEDbQuery", async () => {
  const dbQuery: SEDbQuery = new SEDbQuery();

  test("should return a object containing all number, boolean, string and regex filters", async () => {
    dbQuery.booleanFilters = [
      { fieldName: "isHungry", value: true },
      { fieldName: "haveCar", value: false },
    ];
    dbQuery.stringFilters = [{ fieldName: "name", value: "Bob Marley" }];
    dbQuery.numberFilters = [{ fieldName: "age", op: { $eq: 20 } }];
    dbQuery.regexFilters = [
      { fieldName: "desc", op: { $regex: "balloon", $options: "imx" } },
      { fieldName: "title", op: { $regex: "balloon", $options: "imx" } },
    ];

    const result = {
      isHungry: true,
      haveCar: false,
      name: "Bob Marley",
      age: { $eq: 20 },
      $or: [
        { desc: { $regex: "balloon", $options: "imx" } },
        { title: { $regex: "balloon", $options: "imx" } },
      ],
    };

    expect(dbQuery.getFilter()).to.eql(result);
  });

  test("should return correct ogFilterObj based on ogFilter array", async () => {
    const dbQuery: SEDbQuery = new SEDbQuery();

    dbQuery.onlyGetFilters = [
      { fieldName: "name", value: 1 },
      { fieldName: "age", value: 1 },
    ];

    const result = {
      name: 1,
      age: 1,
    };

    expect(dbQuery.getOgFilter()).to.eql(result);
  });

  test("should return correct sortFilter object based on sortFilter array", async () => {
    const dbQuery: SEDbQuery = new SEDbQuery();

    dbQuery.sortFilters = [
      { fieldName: "age", direction: 1 },
      { fieldName: "name", direction: -1 },
    ];

    const result = { age: 1, name: -1 };

    expect(dbQuery.getSortFilter()).to.eql(result);
  });
});
