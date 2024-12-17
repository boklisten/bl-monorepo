import { DbQueryBooleanFilter } from "@/query/boolean-filter/db-query-boolean-filter";
import { DbQueryDateFilter } from "@/query/date-filter/db-query-date-filter";
import { DbQueryExpandFilter } from "@/query/expand-filter/db-query-expand-filter";
import { DbQueryLimitFilter } from "@/query/limit-filter/db-query-limit-filter";
import { DbQueryNumberFilter } from "@/query/number-filter/db-query-number-filter";
import { DbQueryObjectIdFilter } from "@/query/object-id-filter/db-query-object-id-filter";
import { DbQueryOnlyGetFilter } from "@/query/only-get-filter/db-query-only-get-filter";
import { DbQueryRegexFilter } from "@/query/regex-filter/db-query-regex-filter";
import { SEDbQuery } from "@/query/se.db-query";
import { DbQuerySkipFilter } from "@/query/skip-filter/db-query-skip-filter";
import { DbQuerySortFilter } from "@/query/sort-filter/db-query-sort-filter";
import { DbQueryStringFilter } from "@/query/string-filter/db-query-string-filter";
import {
  DbQueryValidParams,
  ValidParam,
} from "@/query/valid-param/db-query-valid-params";

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
  public getDbQuery(query: any, validQueryParams: ValidParam[]): SEDbQuery {
    this.dbQueryValidParams = new DbQueryValidParams(validQueryParams);

    const dbQuery: SEDbQuery = new SEDbQuery();

    if (
      !query ||
      (Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      return dbQuery;
    }

    try {
      dbQuery.booleanFilters = this.dbQueryBooleanFilter.getBooleanFilters(
        query,
        this.dbQueryValidParams.getValidBooleanParams(),
      );
      dbQuery.dateFilters = this.dbQueryDateFilter.getDateFilters(
        query,
        this.dbQueryValidParams.getValidDateParams(),
      );
      dbQuery.limitFilter = this.dbQueryLimitFilter.getLimitFilter(query);
      dbQuery.numberFilters = this.dbQueryNumberFilter.getNumberFilters(
        query,
        this.dbQueryValidParams.getValidNumberParams(),
      );
      dbQuery.onlyGetFilters = this.dbQueryOnlyGetFilter.getOnlyGetFilters(
        query,
        this.dbQueryValidParams.getAllValidParams(),
      );
      dbQuery.regexFilters = this.dbQueryRegexFilter.getRegexFilters(
        query,
        this.dbQueryValidParams.getValidStringParams(),
      );
      dbQuery.skipFilter = this.dbQuerySkipFilter.getSkipFilter(query);
      dbQuery.sortFilters = this.dbQuerySortFilter.getSortFilters(
        query,
        this.dbQueryValidParams.getAllValidParams(),
      );
      dbQuery.stringFilters = this.dbQueryStringFilter.getStringFilters(
        query,
        this.dbQueryValidParams.getValidStringParams(),
      );
      dbQuery.objectIdFilters = this.dbQueryObjectIdFilter.getObjectIdFilters(
        query,
        this.dbQueryValidParams.getValidObjectIdParams(),
      );
      dbQuery.expandFilters = this.dbQueryExpandFilter.getExpandFilters(
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

    return dbQuery;
  }
}
