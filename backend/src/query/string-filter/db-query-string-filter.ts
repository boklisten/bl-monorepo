export interface StringFilter {
  fieldName: string;
  value: string;
}

export class DbQueryStringFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStringFilters(query: any, validStringParams: string[]): StringFilter[] {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      throw new TypeError("query can not be undefined or empty");
    }
    if (validStringParams.length <= 0) return [];

    const stringFilters: StringFilter[] = [];

    try {
      for (const param in query) {
        if (validStringParams.includes(param)) {
          stringFilters.push({
            fieldName: param,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            value: Array.isArray(query[param])
              ? query[param]
              : this.getStringParamValue(query[param]),
          });
        }
      }

      return stringFilters;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new TypeError(
          "query includes bad string parameter data, reason: " + error.message,
        );
      }

      throw new Error(
        "could not parse the string parameters in query, reason: " +
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          error.message,
      );
    }
  }

  private getStringParamValue(param: string): string {
    if (this.validateStringParam(param)) {
      return param;
    }
    throw new TypeError(
      'the paramterer of value "' + param + '" is not a valid string',
    );
  }

  private validateStringParam(param: string): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return param && typeof param === "string" && param.length > 0;
  }
}
