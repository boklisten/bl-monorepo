import { BlError } from "@boklisten/bl-model";
import { ObjectId } from "mongodb";

import { BooleanFilter } from "@/query/boolean-filter/db-query-boolean-filter";
import { DateFilter } from "@/query/date-filter/db-query-date-filter";
import { ExpandFilter } from "@/query/expand-filter/db-query-expand-filter";
import { LimitFilter } from "@/query/limit-filter/db-query-limit-filter";
import { NumberFilter } from "@/query/number-filter/db-query-number-filter";
import { ObjectIdFilter } from "@/query/object-id-filter/db-query-object-id-filter";
import { OnlyGetFilter } from "@/query/only-get-filter/db-query-only-get-filter";
import { RegexFilter } from "@/query/regex-filter/db-query-regex-filter";
import { SkipFilter } from "@/query/skip-filter/db-query-skip-filter";
import { SortFilter } from "@/query/sort-filter/db-query-sort-filter";
import { StringFilter } from "@/query/string-filter/db-query-string-filter";

export class SEDbQuery {
  booleanFilters: BooleanFilter[];
  dateFilters: DateFilter[];
  numberFilters: NumberFilter[];
  stringFilters: StringFilter[];
  objectIdFilters: ObjectIdFilter[];
  onlyGetFilters: OnlyGetFilter[];
  skipFilter: SkipFilter;
  sortFilters: SortFilter[];
  limitFilter: LimitFilter;
  regexFilters: RegexFilter[];
  expandFilters: ExpandFilter[];

  constructor() {
    this.booleanFilters = [];
    this.dateFilters = [];
    this.numberFilters = [];
    this.stringFilters = [];
    this.objectIdFilters = [];
    this.onlyGetFilters = [];
    this.skipFilter = { skip: 0 };
    this.sortFilters = [];
    this.limitFilter = { limit: 0 };
    this.regexFilters = [];
    this.expandFilters = [];
  }

  getFilter() {
    const filterObj = {};
    const orArr = [];

    for (const booleanFilter of this.booleanFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObj[booleanFilter.fieldName] = booleanFilter.value;
    }

    for (const dateFilter of this.dateFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObj[dateFilter.fieldName] = dateFilter.op;
    }

    for (const numberFilter of this.numberFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObj[numberFilter.fieldName] = numberFilter.op;
    }

    for (const stringFilter of this.stringFilters) {
      if (Array.isArray(stringFilter.value)) {
        const arr = stringFilter.value;
        for (const stringValue of arr) {
          const multipleValuesFilterObj = {};
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          multipleValuesFilterObj[stringFilter.fieldName] = stringValue;
          orArr.push(multipleValuesFilterObj);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filterObj[stringFilter.fieldName] = stringFilter.value;
      }
    }

    for (const objectIdFilter of this.objectIdFilters) {
      if (Array.isArray(objectIdFilter.value)) {
        const arr = objectIdFilter.value;
        for (const stringValue of arr) {
          if (!ObjectId.isValid(stringValue))
            throw new BlError(`Invalid ObjectID: ${stringValue}`).code(701);
          const multipleValuesFilterObj = {};
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          multipleValuesFilterObj[objectIdFilter.fieldName] = stringValue;
          orArr.push(multipleValuesFilterObj);
        }
      } else {
        if (!ObjectId.isValid(objectIdFilter.value))
          throw new BlError(`Invalid ObjectID: ${objectIdFilter.value}`).code(
            701,
          );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filterObj[objectIdFilter.fieldName] = objectIdFilter.value;
      }
    }

    for (const regexFilter of this.regexFilters) {
      const regexFilterObj = {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      regexFilterObj[regexFilter.fieldName] = regexFilter.op;
      orArr.push(regexFilterObj);
    }

    if (orArr.length > 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObj["$or"] = orArr;
    }

    return filterObj;
  }

  getOgFilter() {
    const ogFilterObj = {};

    for (const ogFilter of this.onlyGetFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ogFilterObj[ogFilter.fieldName] = ogFilter.value;
    }
    return ogFilterObj;
  }

  getLimitFilter(): number {
    return this.limitFilter.limit;
  }

  getSkipFilter(): number {
    return this.skipFilter.skip;
  }

  getExpandFilter() {
    return this.expandFilters;
  }

  getSortFilter() {
    const sortFilterObj = {};

    for (const sortFilter of this.sortFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sortFilterObj[sortFilter.fieldName] = sortFilter.direction;
    }

    return sortFilterObj;
  }
}
