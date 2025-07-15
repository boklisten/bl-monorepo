import { BlError } from "@boklisten/backend/shared/bl-error/bl-error";
import { AccessToken } from "@boklisten/backend/shared/token/access-token";
import { decodeToken } from "react-jwt";

import BlFetcher from "@/api/blFetcher";
import { add, get } from "@/api/storage";
import { publicApiClient } from "@/utils/api/publicApiClient";
import BL_CONFIG from "@/utils/bl-config";

const accessTokenName = BL_CONFIG.token.accessToken;
const refreshTokenName = BL_CONFIG.token.refreshToken;

export const haveAccessToken = (): boolean => {
  return get(accessTokenName) !== null;
};

const haveRefreshToken = (): boolean => {
  return get(refreshTokenName) !== null;
};

export const addAccessToken = (value: string): void => {
  if (!value || value.length <= 0) {
    throw new Error("provided value is empty or undefined");
  }
  add(accessTokenName, value);
};

export const addRefreshToken = (value: string): void => {
  if (!value || value.length <= 0) {
    throw new Error("provided value is empty or undefined");
  }
  add(refreshTokenName, value);
};

export const getAccessToken = (): string | null => {
  return get(accessTokenName);
};

export const getRefreshToken = (): string | null => {
  return get(refreshTokenName);
};

export const getAccessTokenBody = (): AccessToken => {
  const token = getAccessToken();

  if (!token) {
    throw new Error("could not get accessToken");
  }

  let decodedToken;
  try {
    decodedToken = decodeToken(token);
  } catch (error) {
    throw new Error("accessToken is not valid: " + error);
  }

  return decodedToken as AccessToken;
};

export const fetchNewTokens = async () => {
  if (!haveRefreshToken()) {
    throw new BlError("Login required");
  }
  const tokens = await BlFetcher.fetch<
    [
      {
        accessToken: string;
      },
      {
        refreshToken: string;
      },
    ]
  >(
    publicApiClient.$url("auth.token"),
    "POST",
    {
      refreshToken: getRefreshToken(),
    },
    true,
  );
  addAccessToken(tokens[0].accessToken);
  addRefreshToken(tokens[1].refreshToken);
};
