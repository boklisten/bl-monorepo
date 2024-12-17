export interface RegexFilter {
  fieldName: string;
  op: {
    $regex: string;
    $options: string;
  };
}

export class DbQueryRegexFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRegexFilters(query: any, validRegexParams: string[]): RegexFilter[] {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      throw new TypeError("query can not be undefined or empty");
    }

    let searchString = query.s;

    if (!searchString) return [];

    searchString = this.sanitizeSearchString(searchString);

    if (searchString.length < 3)
      throw new TypeError(
        'search string "' + searchString + '" is under 3 chars long',
      );

    return this.generateRegexFilters(searchString, validRegexParams);
  }

  private sanitizeSearchString(searchString: string) {
    const searchStringArr = searchString.split(" ");
    let returnString = "";
    for (const word of searchStringArr) {
      if (returnString.length > 0) {
        returnString += "[^\\\\S]";
      }
      returnString += word;
    }
    return returnString;
  }

  private generateRegexFilters(
    searchString: string,
    validRegexParams: string[],
  ): RegexFilter[] {
    return validRegexParams.map((validRegexParam) => ({
      fieldName: validRegexParam,
      op: { $regex: searchString, $options: "imx" },
    }));
  }
}
