export interface SortFilter {
  fieldName: string;
  direction: 1 | -1;
}
export class DbQuerySortFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getSortFilters(query: any, validSortParams: string[]): SortFilter[] {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      throw new TypeError("query can not be undefined or empty");
    }

    if (!query.sort) return [];

    return this.generateSortFilters(query.sort, validSortParams);
  }

  private generateSortFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sort: any,
    validSortParams: string[],
  ): SortFilter[] {
    if (!Array.isArray(sort) && typeof sort !== "string")
      throw new TypeError(
        'sort of value "' + sort + '" is not of type Array[string] or string',
      );

    const sortArray = Array.isArray(sort) ? sort : [sort];

    return sortArray
      .filter((sortValue) => this.validSortValue(sortValue, validSortParams))
      .map((sortValue) => this.getSortFilter(sortValue));
  }

  private getSortFilter(sortValue: string): SortFilter {
    return {
      fieldName: this.getBaseSortParam(sortValue),
      direction: this.getDirection(sortValue),
    };
  }

  private validSortValue(
    sortValue: string,
    validSortParams: string[],
  ): boolean {
    const sval = this.getBaseSortParam(sortValue);

    if (!validSortParams.includes(sval))
      throw ReferenceError(
        'sort parameter "' + sval + '" is not in validSortParams',
      );

    return true;
  }

  private getBaseSortParam(sortValue: string) {
    return sortValue[0] === "-" ? sortValue.slice(1) : sortValue;
  }

  private getDirection(sortValue: string): 1 | -1 {
    return sortValue[0] === "-" ? -1 : 1;
  }
}
