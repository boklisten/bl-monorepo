import { BlCollectionName } from "@backend/collections/bl-collection";
import mongoose, { Model, Schema } from "mongoose";

export class MongooseModelCreator<T> {
  constructor(
    private collectionName: BlCollectionName,
    private schema: Schema,
  ) {}

  create(): Model<T> {
    return mongoose.model<T>(
      this.collectionName,
      this.standardizeSchema(this.schema),
    );
  }

  private standardizeSchema(schema: Schema): Schema {
    schema.add({
      blid: String,
      active: {
        type: Boolean,
        default: true,
      },
      user: {
        type: {
          id: String,
          permission: String,
        },
      },
      viewableFor: {
        type: [String],
        default: [],
      },
      viewableForPermission: {
        type: String,
      },
      editableFor: {
        type: [String],
        default: [],
      },
      archived: {
        type: Boolean,
        default: false,
      },
    });

    //remove fields that the client shall not see
    schema.set("toJSON", { transform: MongooseModelCreator.transformObject });
    schema.set("toObject", {
      transform: MongooseModelCreator.transformObject,
    });

    // Enable automatic timestamps
    schema.set("timestamps", {
      createdAt: "creationTime",
      updatedAt: "lastUpdated",
    });

    return schema;
  }

  public static transformObject(
    document_: unknown,
    returnValue?: unknown,
  ): void {
    // Mongoose isn't sure which parameter to use, so try both :/
    if (!returnValue && document_) returnValue = document_;
    if (!returnValue) return;
    // Arrays are also "object" and can be handled the same way
    if (typeof returnValue === "object") {
      const document = returnValue as Record<string, unknown>;
      // Translate _id to id only if id does not already exist
      // (embedded documents such as BlDocument.user may have an id field which is different from the _id field)
      if ("_id" in document && !("id" in document))
        document["id"] = document["_id"];
      delete document["_id"];
      delete document["__v"];
      for (const key of Object.keys(document)) {
        const value = document[key];
        if (value instanceof mongoose.Types.ObjectId) {
          document[key] = String(value);
        } else if (typeof value === "object") {
          MongooseModelCreator.transformObject(value);
        }
      }
    }
  }
}
