import { Schema } from "mongoose";

import { BlCollectionName } from "@/collections/bl-collection";

export interface NestedDocument {
  field: string;
  collection: BlCollectionName;
  mongooseSchema: Schema;
}
