export interface LimitFilter {
  limit: number;
}

export class DbQueryLimitFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getLimitFilter(query: any): LimitFilter {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    )
      throw new TypeError("the given query can not be null or undefined");
    if (!query.limit) return { limit: 0 };
    if (!this.validNumber(query.limit))
      throw new TypeError(
        'limit with value "' +
          query.limit +
          '" is not a valid number, number must be valid and over 0',
      );

    const limitNum = parseInt(query.limit);

    return { limit: limitNum };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validNumber(limit: any) {
    const limitStr = limit.toString();

    for (const n of limitStr) {
      if (!parseInt(n) && n !== "0") return false;
    }

    return true;
  }
}
