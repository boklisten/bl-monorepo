import CollectionEndpoint from "#services/collection-endpoint/collection-endpoint";
import BlCollections from "#services/collections/bl-collections";

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
