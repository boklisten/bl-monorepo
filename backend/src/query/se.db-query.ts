import { BooleanFilter } from "@backend/query/boolean-filter/db-query-boolean-filter";
import { DateFilter } from "@backend/query/date-filter/db-query-date-filter";
import { ExpandFilter } from "@backend/query/expand-filter/db-query-expand-filter";
import { LimitFilter } from "@backend/query/limit-filter/db-query-limit-filter";
import { NumberFilter } from "@backend/query/number-filter/db-query-number-filter";
import { ObjectIdFilter } from "@backend/query/object-id-filter/db-query-object-id-filter";
import { OnlyGetFilter } from "@backend/query/only-get-filter/db-query-only-get-filter";
import { RegexFilter } from "@backend/query/regex-filter/db-query-regex-filter";
import { SkipFilter } from "@backend/query/skip-filter/db-query-skip-filter";
import { SortFilter } from "@backend/query/sort-filter/db-query-sort-filter";
import { StringFilter } from "@backend/query/string-filter/db-query-string-filter";
import { BlError } from "@shared/bl-error/bl-error";
import { ObjectId } from "mongodb";

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
    const filterObject = {};
    const orArray = [];

    for (const booleanFilter of this.booleanFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObject[booleanFilter.fieldName] = booleanFilter.value;
    }

    for (const dateFilter of this.dateFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObject[dateFilter.fieldName] = dateFilter.op;
    }

    for (const numberFilter of this.numberFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObject[numberFilter.fieldName] = numberFilter.op;
    }

    for (const stringFilter of this.stringFilters) {
      if (Array.isArray(stringFilter.value)) {
        const array = stringFilter.value;
        for (const stringValue of array) {
          const multipleValuesFilterObject = {};
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          multipleValuesFilterObject[stringFilter.fieldName] = stringValue;
          orArray.push(multipleValuesFilterObject);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filterObject[stringFilter.fieldName] = stringFilter.value;
      }
    }

    for (const objectIdFilter of this.objectIdFilters) {
      if (Array.isArray(objectIdFilter.value)) {
        const array = objectIdFilter.value;
        for (const stringValue of array) {
          if (!ObjectId.isValid(stringValue))
            throw new BlError(`Invalid ObjectID: ${stringValue}`).code(701);
          const multipleValuesFilterObject = {};
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          multipleValuesFilterObject[objectIdFilter.fieldName] = stringValue;
          orArray.push(multipleValuesFilterObject);
        }
      } else {
        if (!ObjectId.isValid(objectIdFilter.value))
          throw new BlError(`Invalid ObjectID: ${objectIdFilter.value}`).code(
            701,
          );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filterObject[objectIdFilter.fieldName] = objectIdFilter.value;
      }
    }

    for (const regexFilter of this.regexFilters) {
      const regexFilterObject = {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      regexFilterObject[regexFilter.fieldName] = regexFilter.op;
      orArray.push(regexFilterObject);
    }

    if (orArray.length > 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filterObject["$or"] = orArray;
    }

    return filterObject;
  }

  getOgFilter() {
    const ogFilterObject = {};

    for (const ogFilter of this.onlyGetFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ogFilterObject[ogFilter.fieldName] = ogFilter.value;
    }
    return ogFilterObject;
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
    const sortFilterObject = {};

    for (const sortFilter of this.sortFilters) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sortFilterObject[sortFilter.fieldName] = sortFilter.direction;
    }

    return sortFilterObject;
  }
}
