import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";

export interface CollectionEndpointOnRequest<T extends BlDocument>
  extends CollectionEndpointMethod<T> {
  onRequest(blApiRequest: BlApiRequest): Promise<T[]>;
}
