export class DbQueryValidParams {
    validParams;
    constructor(validParams) {
        this.validParams = validParams;
    }
    getValidNumberParams() {
        return this.getValidParamsBasedOnType("number");
    }
    getValidStringParams() {
        return this.getValidParamsBasedOnType("string");
    }
    getValidObjectIdParams() {
        return this.getValidParamsBasedOnType("object-id");
    }
    getValidBooleanParams() {
        return this.getValidParamsBasedOnType("boolean");
    }
    getValidDateParams() {
        return this.getValidParamsBasedOnType("date");
    }
    getValidExpandParams() {
        return this.getValidParamsBasedOnType("expand");
    }
    getAllValidParams() {
        return this.validParams.map((validParameter) => validParameter.fieldName);
    }
    getValidParamsBasedOnType(type) {
        return this.validParams
            .filter((validParameter) => validParameter.type === type)
            .map((validParameter) => validParameter.fieldName);
    }
}
