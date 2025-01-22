import { DbQueryBooleanFilter } from "@backend/express/query/db-query-boolean-filter.js";
import { DbQueryDateFilter } from "@backend/express/query/db-query-date-filter.js";
import { DbQueryExpandFilter } from "@backend/express/query/db-query-expand-filter.js";
import { DbQueryLimitFilter } from "@backend/express/query/db-query-limit-filter.js";
import { DbQueryNumberFilter } from "@backend/express/query/db-query-number-filter.js";
import { DbQueryObjectIdFilter } from "@backend/express/query/db-query-object-id-filter.js";
import { DbQueryOnlyGetFilter } from "@backend/express/query/db-query-only-get-filter.js";
import { DbQueryRegexFilter } from "@backend/express/query/db-query-regex-filter.js";
import { DbQuerySkipFilter } from "@backend/express/query/db-query-skip-filter.js";
import { DbQuerySortFilter } from "@backend/express/query/db-query-sort-filter.js";
import { DbQueryStringFilter } from "@backend/express/query/db-query-string-filter.js";
import {
  DbQueryValidParams,
  ValidParameter,
} from "@backend/express/query/db-query-valid-params.js";
import { SEDbQuery } from "@backend/express/query/se.db-query.js";
import { ParsedQs } from "qs";

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

  public getDbQuery(
    query: ParsedQs,
    validQueryParams: ValidParameter[],
  ): SEDbQuery {
    const dbQueryValidParams = new DbQueryValidParams(validQueryParams);

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
          dbQueryValidParams.getValidBooleanParams(),
        );
      databaseQuery.dateFilters = this.dbQueryDateFilter.getDateFilters(
        query,
        dbQueryValidParams.getValidDateParams(),
      );
      databaseQuery.limitFilter = this.dbQueryLimitFilter.getLimitFilter(query);
      databaseQuery.numberFilters = this.dbQueryNumberFilter.getNumberFilters(
        query,
        dbQueryValidParams.getValidNumberParams(),
      );
      databaseQuery.onlyGetFilters =
        this.dbQueryOnlyGetFilter.getOnlyGetFilters(
          query,
          dbQueryValidParams.getAllValidParams(),
        );
      databaseQuery.regexFilters = this.dbQueryRegexFilter.getRegexFilters(
        query,
        dbQueryValidParams.getValidStringParams(),
      );
      databaseQuery.skipFilter = this.dbQuerySkipFilter.getSkipFilter(query);
      databaseQuery.sortFilters = this.dbQuerySortFilter.getSortFilters(
        query,
        dbQueryValidParams.getAllValidParams(),
      );
      databaseQuery.stringFilters = this.dbQueryStringFilter.getStringFilters(
        query,
        dbQueryValidParams.getValidStringParams(),
      );
      databaseQuery.objectIdFilters =
        this.dbQueryObjectIdFilter.getObjectIdFilters(
          query,
          dbQueryValidParams.getValidObjectIdParams(),
        );
      databaseQuery.expandFilters =
        this.dbQueryExpandFilter.getExpandFilters(query);
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

      // @ts-expect-error fixme: auto ignored
      throw new Error("Error when building query, reason: " + error.message);
    }

    return databaseQuery;
  }
}
