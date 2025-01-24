export class DbQueryOnlyGetFilter {
    getOnlyGetFilters(query, validOnlyGetParams) {
        if (!query ||
            (Object.keys(query).length === 0 && query.constructor === Object)) {
            throw new TypeError("query can not be undefined or empty");
        }
        if (!query["og"] || validOnlyGetParams.length <= 0)
            return [];
        return this.generateOnlyGetFilters(query["og"], validOnlyGetParams);
    }
    generateOnlyGetFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    og, validOnlyGetParams) {
        const onlyGetParameterArray = Array.isArray(og) ? og : [og];
        return onlyGetParameterArray.map((onlyGetParameter) => {
            if (!validOnlyGetParams.includes(onlyGetParameter))
                throw new ReferenceError('the parameter "' +
                    onlyGetParameter +
                    '" is not in validOnlyGetParams');
            return { fieldName: onlyGetParameter, value: 1 };
        });
    }
}
