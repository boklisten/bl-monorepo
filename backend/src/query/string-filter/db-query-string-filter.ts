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
      for (const parameter in query) {
        if (validStringParams.includes(parameter)) {
          stringFilters.push({
            fieldName: parameter,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            value: Array.isArray(query[parameter])
              ? query[parameter]
              : this.getStringParamValue(query[parameter]),
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

  private getStringParamValue(parameter: string): string {
    if (this.validateStringParam(parameter)) {
      return parameter;
    }
    throw new TypeError(
      'the paramterer of value "' + parameter + '" is not a valid string',
    );
  }

  private validateStringParam(parameter: string): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return parameter && typeof parameter === "string" && parameter.length > 0;
  }
}
