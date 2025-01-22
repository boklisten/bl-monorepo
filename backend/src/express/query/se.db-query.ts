import { BooleanFilter } from "@backend/express/query/db-query-boolean-filter.js";
import { DateFilter } from "@backend/express/query/db-query-date-filter.js";
import { ExpandFilter } from "@backend/express/query/db-query-expand-filter.js";
import { LimitFilter } from "@backend/express/query/db-query-limit-filter.js";
import { NumberFilter } from "@backend/express/query/db-query-number-filter.js";
import { ObjectIdFilter } from "@backend/express/query/db-query-object-id-filter.js";
import { OnlyGetFilter } from "@backend/express/query/db-query-only-get-filter.js";
import { RegexFilter } from "@backend/express/query/db-query-regex-filter.js";
import { SkipFilter } from "@backend/express/query/db-query-skip-filter.js";
import { SortFilter } from "@backend/express/query/db-query-sort-filter.js";
import { StringFilter } from "@backend/express/query/db-query-string-filter.js";
import { BlError } from "@shared/bl-error/bl-error.js";
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
      // @ts-expect-error fixme: auto ignored
      filterObject[booleanFilter.fieldName] = booleanFilter.value;
    }

    for (const dateFilter of this.dateFilters) {
      // @ts-expect-error fixme: auto ignored
      filterObject[dateFilter.fieldName] = dateFilter.op;
    }

    for (const numberFilter of this.numberFilters) {
      // @ts-expect-error fixme: auto ignored
      filterObject[numberFilter.fieldName] = numberFilter.op;
    }

    for (const stringFilter of this.stringFilters) {
      if (Array.isArray(stringFilter.value)) {
        const array = stringFilter.value;
        for (const stringValue of array) {
          const multipleValuesFilterObject = {};

          // @ts-expect-error fixme: auto ignored
          multipleValuesFilterObject[stringFilter.fieldName] = stringValue;
          orArray.push(multipleValuesFilterObject);
        }
      } else {
        // @ts-expect-error fixme: auto ignored
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

          // @ts-expect-error fixme: auto ignored
          multipleValuesFilterObject[objectIdFilter.fieldName] = stringValue;
          orArray.push(multipleValuesFilterObject);
        }
      } else {
        if (!ObjectId.isValid(objectIdFilter.value))
          throw new BlError(`Invalid ObjectID: ${objectIdFilter.value}`).code(
            701,
          );

        // @ts-expect-error fixme: auto ignored
        filterObject[objectIdFilter.fieldName] = objectIdFilter.value;
      }
    }

    for (const regexFilter of this.regexFilters) {
      const regexFilterObject = {};

      // @ts-expect-error fixme: auto ignored
      regexFilterObject[regexFilter.fieldName] = regexFilter.op;
      orArray.push(regexFilterObject);
    }

    if (orArray.length > 0) {
      // @ts-expect-error fixme: auto ignored
      filterObject["$or"] = orArray;
    }

    return filterObject;
  }

  getOgFilter() {
    const ogFilterObject = {};

    for (const ogFilter of this.onlyGetFilters) {
      // @ts-expect-error fixme: auto ignored
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
      // @ts-expect-error fixme: auto ignored
      sortFilterObject[sortFilter.fieldName] = sortFilter.direction;
    }

    return sortFilterObject;
  }
}
