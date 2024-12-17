import moment from "moment";

export interface DateFilter {
  fieldName: string;
  op: {
    $lt?: Date;
    $gt?: Date;
    $eq?: Date;
  };
}

export class DbQueryDateFilter {
  private operationIdentifiers: {
    op: string;
    opIdentifier: string;
    atIndex: number;
  }[];

  private dateFormat: string;

  public constructor() {
    this.dateFormat = "DDMMYYYYHHmm";
    this.operationIdentifiers = [
      { op: "$gt", opIdentifier: ">", atIndex: 0 },
      { op: "$lt", opIdentifier: "<", atIndex: 0 },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getDateFilters(query: any, validDateParams: string[]): DateFilter[] {
    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    )
      throw new TypeError("the given query can not be null or undefined");

    try {
      for (const param in query) {
        if (Object.prototype.hasOwnProperty.call(query, param)) {
          if (validDateParams.indexOf(param) > -1) {
            if (Array.isArray(query[param])) {
              return this.generateMultipleDateFilter(param, query[param]);
            } else {
              return [this.generateSingleDayFilter(param, query[param])];
            }
          }
        }
      }

      return [];
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new SyntaxError();
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return undefined;
  }

  private generateSingleDayFilter(
    fieldName: string,
    value: string,
  ): DateFilter {
    if (!value)
      throw new Error(
        "QueryBuilderDateFilter.generateDateFilter(): value is not defined",
      );

    const operation = this.getOperation(value);

    if (operation) {
      value = value.slice(1, value.length);
    }

    let momentDate;

    try {
      momentDate = moment(value, this.dateFormat, true);
    } catch {
      throw new SyntaxError("generateDateFilter(): invalid date");
    }

    if (!momentDate.isValid()) {
      throw new SyntaxError("generateDateFilter(): invalid date");
    }

    const isoDate = momentDate.toDate();
    //let lessThanIsoDate = momentDate.add(1, 'day').toISOString();

    if (operation) {
      const op = {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      op[operation] = isoDate;

      return {
        fieldName: fieldName,
        op: op,
      };
    }

    return { fieldName: fieldName, op: { $eq: isoDate } };
  }

  private generateMultipleDateFilter(
    fieldName: string,
    values: string[],
  ): DateFilter[] {
    const operations = {};

    for (const value of values) {
      const op = this.getOperation(value);
      const theDateString = value.slice(1);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      operations[op] = moment(theDateString, this.dateFormat, true).toDate();
    }

    return [{ fieldName: fieldName, op: operations }];
  }

  private getOperation(value: string): string {
    for (const operationIdentifier of this.operationIdentifiers) {
      if (value.length >= operationIdentifier.atIndex) {
        if (
          operationIdentifier.opIdentifier ===
          value[operationIdentifier.atIndex]
        ) {
          return operationIdentifier.op;
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return null;
  }
}
