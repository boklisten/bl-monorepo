import { ObjectId } from "mongodb";
import { Types } from "mongoose";
export class DbQueryObjectIdFilter {
    getObjectIdFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query, validStringParams) {
        if (!query ||
            (Object.keys(query).length === 0 && query.constructor === Object)) {
            throw new TypeError("query can not be undefined or empty");
        }
        if (validStringParams.length <= 0)
            return [];
        const objectIdFilters = [];
        if (ObjectId.isValid(query.s)) {
            query._id = query.s;
        }
        try {
            for (const parameter in query) {
                if (validStringParams.includes(parameter)) {
                    if (Array.isArray(query[parameter])) {
                        const valueArray = [];
                        query[parameter].forEach((parameterValue) => {
                            valueArray.push(this.getStringParamValue(parameterValue));
                            valueArray.push(this.getObjectIdParamValue(parameterValue));
                        });
                        objectIdFilters.push({
                            fieldName: parameter,
                            value: valueArray,
                        });
                    }
                    else {
                        const valueArray = [
                            this.getStringParamValue(query[parameter]),
                            this.getObjectIdParamValue(query[parameter]),
                        ];
                        objectIdFilters.push({
                            fieldName: parameter,
                            value: valueArray,
                        });
                    }
                }
            }
            return objectIdFilters;
        }
        catch (error) {
            if (error instanceof TypeError) {
                throw new TypeError("query includes bad object-id parameter data, reason: " +
                    error.message);
            }
            throw new Error("could not parse the object-id parameters in query, reason: " +
                // @ts-expect-error fixme: auto ignored
                error.message);
        }
    }
    getObjectIdParamValue(parameter) {
        if (this.validateStringParam(parameter)) {
            return new Types.ObjectId(parameter);
        }
        throw new TypeError('the paramterer of value "' + parameter + '" is not a valid string');
    }
    getStringParamValue(parameter) {
        if (this.validateStringParam(parameter)) {
            return parameter;
        }
        throw new TypeError('the paramterer of value "' + parameter + '" is not a valid string');
    }
    validateStringParam(parameter) {
        return ((parameter?.length ?? 0) > 0 &&
            new Types.ObjectId(parameter).toString() === parameter);
    }
}
