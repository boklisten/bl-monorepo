import "mocha";
import { DbQueryObjectIdFilter } from "@backend/query/db-query-object-id-filter.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import mongoose from "mongoose";

chaiUse(chaiAsPromised);
should();

describe("DbQueryObjectIdFilter", () => {
  const dbQueryObjectIdFilter: DbQueryObjectIdFilter =
    new DbQueryObjectIdFilter();

  describe("getObjectIdFilters()", () => {
    it("should return empty array if query is valid and validObjectIdParams is empty", () => {
      expect(
        dbQueryObjectIdFilter.getObjectIdFilters(
          { name: "5c2e0e5bb311ba0701f15967" },
          [],
        ),
      ).to.eql([]);
    });

    it("should throw TypeError if query is empty", () => {
      expect(() => {
        dbQueryObjectIdFilter.getObjectIdFilters({}, ["id"]);
      }).to.throw(TypeError);
    });

    it("should throw error when both query and validParams are empty ", () => {
      expect(() => {
        dbQueryObjectIdFilter.getObjectIdFilters({}, []);
      }).to.throw(TypeError);
    });

    it("should throw Error if parameter is not a valid object-id", () => {
      expect(() => {
        dbQueryObjectIdFilter.getObjectIdFilters({ id: { test: {} } }, ["id"]);
      }).to.throw(Error);
    });

    it("should not change values in query that are not in ValidObjectIdParams", () => {
      const result = [
        {
          fieldName: "id",
          value: [
            "5c2e0e5bb311ba0701f15967",
            new mongoose.Types.ObjectId("5c2e0e5bb311ba0701f15967"),
          ],
        },
      ];
      expect(
        dbQueryObjectIdFilter.getObjectIdFilters(
          { id: "5c2e0e5bb311ba0701f15967" },
          ["id"],
        ),
      ).to.eql(result);
    });

    it("should return correct array given valid input", () => {
      const query = {
        id: "5c2e0e5bb311ba0701f15967",
        customer: "5c2e0e5bb311ba0701f15967",
        branch: ["5c2e0e5bb311ba0701f15968", "5c2e0e5bb311ba0701f15967"],
      };
      const result = [
        {
          fieldName: "id",
          value: [
            "5c2e0e5bb311ba0701f15967",
            new mongoose.Types.ObjectId("5c2e0e5bb311ba0701f15967"),
          ],
        },
        {
          fieldName: "customer",
          value: [
            "5c2e0e5bb311ba0701f15967",
            new mongoose.Types.ObjectId("5c2e0e5bb311ba0701f15967"),
          ],
        },
        {
          fieldName: "branch",
          value: [
            "5c2e0e5bb311ba0701f15968",
            new mongoose.Types.ObjectId("5c2e0e5bb311ba0701f15968"),
            "5c2e0e5bb311ba0701f15967",
            new mongoose.Types.ObjectId("5c2e0e5bb311ba0701f15967"),
          ],
        },
      ];

      expect(
        dbQueryObjectIdFilter.getObjectIdFilters(query, [
          "id",
          "customer",
          "branch",
        ]),
      ).to.eql(result);
    });
  });
});
