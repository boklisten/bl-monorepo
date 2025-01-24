export class DbQuerySortFilter {
    getSortFilters(query, validSortParams) {
        if (!query ||
            (Object.keys(query).length === 0 && query.constructor === Object)) {
            throw new TypeError("query can not be undefined or empty");
        }
        if (!query["sort"])
            return [];
        return this.generateSortFilters(query["sort"], validSortParams);
    }
    generateSortFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sort, validSortParams) {
        if (!Array.isArray(sort) && typeof sort !== "string")
            throw new TypeError('sort of value "' + sort + '" is not of type Array[string] or string');
        const sortArray = Array.isArray(sort) ? sort : [sort];
        return sortArray
            .filter((sortValue) => this.validSortValue(sortValue, validSortParams))
            .map((sortValue) => this.getSortFilter(sortValue));
    }
    getSortFilter(sortValue) {
        return {
            fieldName: this.getBaseSortParam(sortValue),
            direction: this.getDirection(sortValue),
        };
    }
    validSortValue(sortValue, validSortParams) {
        const sval = this.getBaseSortParam(sortValue);
        if (!validSortParams.includes(sval))
            throw new ReferenceError('sort parameter "' + sval + '" is not in validSortParams');
        return true;
    }
    getBaseSortParam(sortValue) {
        return sortValue[0] === "-" ? sortValue.slice(1) : sortValue;
    }
    getDirection(sortValue) {
        return sortValue[0] === "-" ? -1 : 1;
    }
}
