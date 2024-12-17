import { BlCollectionName } from "@backend/collections/bl-collection";
import { Schema } from "mongoose";

export interface NestedDocument {
  field: string;
  collection: BlCollectionName;
  mongooseSchema: Schema;
}
