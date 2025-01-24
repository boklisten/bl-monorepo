/**
 * Expand filter is used to retrieve linked documents
 * on a get request.
 *
 * Ex. a query like "GET order/xyz?expand=customer" will also
 * try to fetch the nested customer object and add it to the
 * Order document on return
 */
export class DbQueryExpandFilter {
    getExpandFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query) {
        if (!query ||
            (Object.keys(query).length === 0 && query.constructor === Object)) {
            throw new TypeError("query can not be undefined or empty");
        }
        if (!query.expand) {
            return [];
        }
        return this.generateExpandFilter(query.expand);
    }
    generateExpandFilter(expand) {
        let expandFilterArray = [];
        expandFilterArray = Array.isArray(expand) ? expand : [expand];
        const expandFilters = [];
        for (const expandFilter of expandFilterArray) {
            expandFilters.push({ fieldName: expandFilter });
        }
        return expandFilters;
    }
}
