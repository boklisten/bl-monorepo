import { DbQueryBooleanFilter } from "@backend/query/boolean-filter/db-query-boolean-filter";
import { DbQueryDateFilter } from "@backend/query/date-filter/db-query-date-filter";
import { DbQueryExpandFilter } from "@backend/query/expand-filter/db-query-expand-filter";
import { DbQueryLimitFilter } from "@backend/query/limit-filter/db-query-limit-filter";
import { DbQueryNumberFilter } from "@backend/query/number-filter/db-query-number-filter";
import { DbQueryObjectIdFilter } from "@backend/query/object-id-filter/db-query-object-id-filter";
import { DbQueryOnlyGetFilter } from "@backend/query/only-get-filter/db-query-only-get-filter";
import { DbQueryRegexFilter } from "@backend/query/regex-filter/db-query-regex-filter";
import { SEDbQuery } from "@backend/query/se.db-query";
import { DbQuerySkipFilter } from "@backend/query/skip-filter/db-query-skip-filter";
import { DbQuerySortFilter } from "@backend/query/sort-filter/db-query-sort-filter";
import { DbQueryStringFilter } from "@backend/query/string-filter/db-query-string-filter";
import {
  DbQueryValidParams,
  ValidParameter,
} from "@backend/query/valid-param/db-query-valid-params";

export class SEDbQueryBuilder {
  private dbQueryBooleanFilter: DbQueryBooleanFilter;
  private dbQueryDateFilter: DbQueryDateFilter;
  private dbQueryLimitFilter: DbQueryLimitFilter;
  private dbQueryNumberFilter: DbQueryNumberFilter;
  private dbQueryOnlyGetFilter: DbQueryOnlyGetFilter;
  private dbQueryRegexFilter: DbQueryRegexFilter;
  private dbQuerySkipFilter: DbQuerySkipFilter;
  private dbQuerySortFilter: DbQuerySortFilter;
  private dbQueryStringFilter: DbQueryStringFilter;
  private dbQueryObjectIdFilter: DbQueryObjectIdFilter;
  private dbQueryExpandFilter: DbQueryExpandFilter;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private dbQueryValidParams: DbQueryValidParams;

  constructor() {
    this.dbQueryBooleanFilter = new DbQueryBooleanFilter();
    this.dbQueryDateFilter = new DbQueryDateFilter();
    this.dbQueryLimitFilter = new DbQueryLimitFilter();
    this.dbQueryNumberFilter = new DbQueryNumberFilter();
    this.dbQueryOnlyGetFilter = new DbQueryOnlyGetFilter();
    this.dbQueryRegexFilter = new DbQueryRegexFilter();
    this.dbQuerySkipFilter = new DbQuerySkipFilter();
    this.dbQuerySortFilter = new DbQuerySortFilter();
    this.dbQueryStringFilter = new DbQueryStringFilter();
    this.dbQueryObjectIdFilter = new DbQueryObjectIdFilter();
    this.dbQueryExpandFilter = new DbQueryExpandFilter();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getDbQuery(query: any, validQueryParams: ValidParameter[]): SEDbQuery {
    this.dbQueryValidParams = new DbQueryValidParams(validQueryParams);

    const databaseQuery: SEDbQuery = new SEDbQuery();

    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      return databaseQuery;
    }

    try {
      databaseQuery.booleanFilters =
        this.dbQueryBooleanFilter.getBooleanFilters(
          query,
          this.dbQueryValidParams.getValidBooleanParams(),
        );
      databaseQuery.dateFilters = this.dbQueryDateFilter.getDateFilters(
        query,
        this.dbQueryValidParams.getValidDateParams(),
      );
      databaseQuery.limitFilter = this.dbQueryLimitFilter.getLimitFilter(query);
      databaseQuery.numberFilters = this.dbQueryNumberFilter.getNumberFilters(
        query,
        this.dbQueryValidParams.getValidNumberParams(),
      );
      databaseQuery.onlyGetFilters =
        this.dbQueryOnlyGetFilter.getOnlyGetFilters(
          query,
          this.dbQueryValidParams.getAllValidParams(),
        );
      databaseQuery.regexFilters = this.dbQueryRegexFilter.getRegexFilters(
        query,
        this.dbQueryValidParams.getValidStringParams(),
      );
      databaseQuery.skipFilter = this.dbQuerySkipFilter.getSkipFilter(query);
      databaseQuery.sortFilters = this.dbQuerySortFilter.getSortFilters(
        query,
        this.dbQueryValidParams.getAllValidParams(),
      );
      databaseQuery.stringFilters = this.dbQueryStringFilter.getStringFilters(
        query,
        this.dbQueryValidParams.getValidStringParams(),
      );
      databaseQuery.objectIdFilters =
        this.dbQueryObjectIdFilter.getObjectIdFilters(
          query,
          this.dbQueryValidParams.getValidObjectIdParams(),
        );
      databaseQuery.expandFilters = this.dbQueryExpandFilter.getExpandFilters(
        query,
        this.dbQueryValidParams.getValidExpandParams(),
      );
    } catch (error) {
      if (error instanceof TypeError)
        throw new TypeError(
          "TypeError when building query, reason: " + error.message,
        );
      if (error instanceof ReferenceError)
        throw new ReferenceError(
          "ReferenceError when building query, reason: " + error.message,
        );
      if (error instanceof RangeError)
        throw new RangeError(
          "RangeError when building query, reason: " + error.message,
        );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error("Error when building query, reason: " + error.message);
    }

    return databaseQuery;
  }
}
