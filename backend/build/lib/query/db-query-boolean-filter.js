export class DbQueryBooleanFilter {
    getBooleanFilters(query, validBooleanParams) {
        if (!query ||
            (Object.keys(query).length === 0 && query.constructor === Object))
            throw new TypeError("the given query can not be null or undefined");
        return this.generateBooleanFilters(query, validBooleanParams);
    }
    generateBooleanFilters(query, validBooleanParams) {
        const booleanFilters = [];
        for (const parameter in query) {
            if (validBooleanParams.includes(parameter)) {
                let value = false;
                if (query[parameter] === "true") {
                    value = true;
                }
                else if (query[parameter] === "false") {
                    value = false;
                }
                else {
                    throw new TypeError('value "' + query[parameter] + '" could not be parsed to boolean');
                }
                booleanFilters.push({ fieldName: parameter, value: value });
            }
        }
        return booleanFilters;
    }
}
