import { BlError } from "@shared/bl-error/bl-error";
import { BlapiErrorResponse } from "@shared/blapi-response/blapi-error-response";
import { HTTP_METHOD } from "next/dist/server/web/http";

import { fetchNewTokens, getAccessToken, haveAccessToken } from "@/api/token";
import BL_CONFIG from "@/utils/bl-config";
import { assertBlApiError, verifyBlApiError } from "@/utils/types";

const createHeaders = (): Headers => {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (haveAccessToken()) {
    headers.set("Authorization", "Bearer " + getAccessToken());
  }
  return headers;
};

async function blFetch<T>(
  path: string,
  method: HTTP_METHOD,
  body?: Record<string, unknown>,
  isRetry = false,
): Promise<T> {
  try {
    const request: RequestInit = { method, headers: createHeaders() };
    if (body) {
      request.body = JSON.stringify(body);
    }
    const response = await fetch(BL_CONFIG.api.basePath + path, request);
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data.data as T;
  } catch (error: unknown) {
    if (verifyBlApiError(error)) {
      if (error.httpStatus === 401 && !isRetry) {
        try {
          await fetchNewTokens();
        } catch (tokenError) {
          // fixme: login required error boundary
          if (!(tokenError instanceof BlError)) {
            assertBlApiError(tokenError);
          }
        }
        return await blFetch(path, method, body, true);
      }
      if (error.httpStatus === 404) {
        return [] as T;
      }
      throw new BlapiErrorResponse(
        error.httpStatus,
        error.code,
        error.msg,
        error.data,
      );
    } else {
      throw new Error("Unknown API error");
    }
  }
}

async function get<T>(path: string): Promise<T> {
  return await blFetch<T>(path, "GET");
}

async function post<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  return await blFetch<T>(path, "POST", body);
}

async function patch<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  return await blFetch<T>(path, "PATCH", body);
}

async function put<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return await blFetch<T>(path, "PUT", body);
}

const BlFetcher = {
  fetch: blFetch,
  get,
  post,
  patch,
  put,
};

export default BlFetcher;
