export interface ExpandFilter {
  fieldName: string;
}

/**
 * Expand filter is used to retrieve linked documents
 * on a get request.
 *
 * Ex. a query like "GET order/xyz?expand=customer" will also
 * try to fetch the nested customer object and add it to the
 * Order document on return
 */
export class DbQueryExpandFilter {
  public getExpandFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    validExpandParams: string[],
  ): ExpandFilter[] {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      throw new TypeError("query can not be undefined or empty");
    }

    if (!query.expand || !validExpandParams || validExpandParams.length <= 0) {
      return [];
    }

    return this.generateExpandFilter(query.expand, validExpandParams);
  }

  private generateExpandFilter(
    expand: string | string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validExpandParams: string[],
  ): ExpandFilter[] {
    let expandFilterArray = [];

    expandFilterArray = Array.isArray(expand) ? expand : [expand];

    const expandFilters: ExpandFilter[] = [];

    for (const expandFilter of expandFilterArray) {
      expandFilters.push({ fieldName: expandFilter });
    }

    return expandFilters;
  }
}
