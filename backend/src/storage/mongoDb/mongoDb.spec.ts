import "mocha";
import { MongooseModelCreator } from "@backend/storage/mongoDb/mongoose-schema-creator";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ObjectId } from "mongodb";

chai.use(chaiAsPromised);

describe("MongooseModelCreator", () => {
  describe("transformObject", () => {
    it("should convert objectIDs in objects to strings", () => {
      const input = {
        _id: new ObjectId(),
        user: new ObjectId(),
        items: [new ObjectId(), new ObjectId()],
      };
      const expectedOutput = {
        id: input._id.toString(),
        user: input.user.toString(),
        items: input.items.map((item) => item.toString()),
      };
      MongooseModelCreator.transformObject(input, undefined);
      expect(input).to.deep.eq(expectedOutput);
    });

    it("should convert objectIDs in an array to strings", () => {
      const input = [new ObjectId(), new ObjectId()];
      const expectedOutput = input.map((item) => item.toString());
      MongooseModelCreator.transformObject(input, undefined);
      expect(input).to.deep.eq(expectedOutput);
    });

    it("should convert objectIDs not named 'id' in nested objects to string", () => {
      const input = { orderItems: [{ item: new ObjectId() }] };
      const expectedOutput = {
        orderItems: [{ item: input.orderItems[0]?.item.toString() }],
      };
      MongooseModelCreator.transformObject(input, undefined);
      expect(input).to.deep.eq(expectedOutput);
    });

    it("should rename '_id'-keys to 'id'", () => {
      const input = { orderItems: [{ _id: "hello" }] };
      const expectedOutput = { orderItems: [{ id: "hello" }] };
      MongooseModelCreator.transformObject(input, undefined);
      expect(input).to.deep.eq(expectedOutput);
    });

    it("should not replace existing 'id'-values with '_id'-values", () => {
      const input = { orderItems: [{ _id: "hello", id: "you" }] };
      const expectedOutput = { orderItems: [{ id: "you" }] };
      MongooseModelCreator.transformObject(input, undefined);
      expect(input).to.deep.eq(expectedOutput);
    });
  });
});
