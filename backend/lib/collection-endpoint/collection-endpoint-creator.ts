import CollectionEndpoint from "@backend/lib/collection-endpoint/collection-endpoint.js";
import BlCollections from "@backend/lib/collections/bl-collections.js";

export function generateEndpoints() {
  for (const collection of BlCollections) {
    for (const endpoint of collection.endpoints) {
      CollectionEndpoint.create(endpoint, collection);
    }
  }
}

const CollectionEndpointCreator = {
  generateEndpoints,
};
export default CollectionEndpointCreator;
