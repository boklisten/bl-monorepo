import "mocha";
import { SEDbQuery } from "@backend/query/se.db-query";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("SEDbQuery", () => {
  describe("getFilter()", () => {
    const dbQuery: SEDbQuery = new SEDbQuery();

    it("should return a object containing all number, boolean, string and regex filters", () => {
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
  });

  describe("getOgFilter()", () => {
    it("should return correct ogFilterObj based on ogFilter array", () => {
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
  });

  describe("getSortFilter()", () => {
    it("should return correct sortFilter object based on sortFilter array", () => {
      const dbQuery: SEDbQuery = new SEDbQuery();

      dbQuery.sortFilters = [
        { fieldName: "age", direction: 1 },
        { fieldName: "name", direction: -1 },
      ];

      const result = { age: 1, name: -1 };

      expect(dbQuery.getSortFilter()).to.eql(result);
    });
  });
});
