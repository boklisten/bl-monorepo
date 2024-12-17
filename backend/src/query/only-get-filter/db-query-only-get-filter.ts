export interface OnlyGetFilter {
  fieldName: string;
  value: number;
}

export class DbQueryOnlyGetFilter {
  public getOnlyGetFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    validOnlyGetParams: string[],
  ): OnlyGetFilter[] {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      throw new TypeError("query can not be undefined or empty");
    }

    if (!query.og || validOnlyGetParams.length <= 0) return [];

    return this.generateOnlyGetFilters(query.og, validOnlyGetParams);
  }

  private generateOnlyGetFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    og: any,
    validOnlyGetParams: string[],
  ): OnlyGetFilter[] {
    const onlyGetParamArray = Array.isArray(og) ? og : [og];

    return onlyGetParamArray.map((onlyGetParam) => {
      if (!validOnlyGetParams.includes(onlyGetParam))
        throw ReferenceError(
          'the parameter "' + onlyGetParam + '" is not in validOnlyGetParams',
        );
      return { fieldName: onlyGetParam, value: 1 };
    });
  }
}
