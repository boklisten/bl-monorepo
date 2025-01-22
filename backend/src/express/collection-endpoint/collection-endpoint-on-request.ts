import { CollectionEndpointMethod } from "@backend/express/collection-endpoint/collection-endpoint-method.js";
import { BlStorageData } from "@backend/express/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";

export interface CollectionEndpointOnRequest extends CollectionEndpointMethod {
  onRequest(blApiRequest: BlApiRequest): Promise<BlStorageData>;
}
