export interface ValidParam {
  fieldName: string;
  type: "string" | "number" | "boolean" | "date" | "expand" | "object-id";
}

export class DbQueryValidParams {
  private validParams: ValidParam[];

  constructor(validParams: ValidParam[]) {
    this.validParams = validParams;
  }

  public getValidNumberParams(): string[] {
    return this.getValidParamsBasedOnType("number");
  }

  public getValidStringParams(): string[] {
    return this.getValidParamsBasedOnType("string");
  }

  public getValidObjectIdParams(): string[] {
    return this.getValidParamsBasedOnType("object-id");
  }

  public getValidBooleanParams(): string[] {
    return this.getValidParamsBasedOnType("boolean");
  }

  public getValidDateParams(): string[] {
    return this.getValidParamsBasedOnType("date");
  }

  public getValidExpandParams(): string[] {
    return this.getValidParamsBasedOnType("expand");
  }

  public getAllValidParams(): string[] {
    return this.validParams.map((validParam) => validParam.fieldName);
  }

  private getValidParamsBasedOnType(type: string) {
    return this.validParams
      .filter((validParam) => validParam.type === type)
      .map((validParam) => validParam.fieldName);
  }
}
