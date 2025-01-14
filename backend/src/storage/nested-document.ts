import { BlModel } from "@backend/collections/bl-collection";

export interface NestedDocument {
  field: string;
  model: BlModel;
}
