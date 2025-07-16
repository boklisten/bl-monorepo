import { BlapiErrorResponse } from "@boklisten/backend/shared/blapi-response/blapi-error-response";
import { HTTP_METHOD } from "next/dist/server/web/http";

import {
  addAccessToken,
  addRefreshToken,
  getAccessToken,
  getRefreshToken,
  haveAccessToken,
} from "@/api/token";
import { publicApiClient } from "@/utils/api/publicApiClient";
import { verifyBlApiError } from "@/utils/types";

const createHeaders = (): Headers => {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (haveAccessToken()) {
    headers.set("Authorization", "Bearer " + getAccessToken());
  }
  return headers;
};

/**
 * @depricated use the useApiClient hook instead
 */
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
    const response = await fetch(path, request);
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data.data as T;
  } catch (error: unknown) {
    if (verifyBlApiError(error)) {
      if (error.httpStatus === 401 && !isRetry) {
        const { accessToken, refreshToken } = await publicApiClient.v2.token
          .$post({
            refreshToken: getRefreshToken() ?? "",
          })
          .unwrap();
        addAccessToken(accessToken);
        addRefreshToken(refreshToken);
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

/**
 * @depricated use the useApiClient hook instead
 */
async function get<T>(path: string): Promise<T> {
  return await blFetch<T>(path, "GET");
}

/**
 * @depricated use the useApiClient hook instead
 */
async function post<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  return await blFetch<T>(path, "POST", body);
}

/**
 * @depricated use the useApiClient hook instead
 */
async function patch<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  return await blFetch<T>(path, "PATCH", body);
}

/**
 * @depricated use the useApiClient hook instead
 */
const BlFetcher = {
  fetch: blFetch,
  get,
  post,
  patch,
};

/**
 * @depricated use the useApiClient hook instead
 */
export default BlFetcher;
