import BlFetcher from "@frontend/api/blFetcher";
import { add, get, removeAll } from "@frontend/api/storage";
import BL_CONFIG from "@frontend/utils/bl-config";
import { AuthResponse } from "@frontend/utils/types";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { decodeToken } from "react-jwt";

const accessTokenName = BL_CONFIG.token.accessToken;
const refreshTokenName = BL_CONFIG.token.refreshToken;

export const haveAccessToken = (): boolean => {
  return get(accessTokenName) !== null;
};

export const haveRefreshToken = (): boolean => {
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

export const removeTokens = (): void => {
  removeAll();
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

export const parseTokensFromResponseDataAndStore = (
  authResponse: AuthResponse,
): boolean => {
  let refreshToken = "";
  let accessToken = "";

  for (const d of authResponse) {
    if (!d.data || d.data.length <= 0) {
      throw new Error("data of refreshToken is not defined");
    }

    if (!d.documentName) {
      throw new Error("documentName is missing on return data");
    }

    if (d.documentName === "refreshToken") {
      refreshToken = d.data;
    } else if (d.documentName === "accessToken") {
      accessToken = d.data;
    }
  }

  if (
    !accessToken ||
    accessToken.length <= 0 ||
    !refreshToken ||
    refreshToken.length <= 0
  ) {
    throw new Error("tokens or one of the tokens are not defined");
  }

  addAccessToken(accessToken);
  addRefreshToken(refreshToken);

  return true;
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
    "token",
    "POST",
    {
      refreshToken: getRefreshToken(),
    },
    true,
  );
  addAccessToken(tokens[0].accessToken);
  addRefreshToken(tokens[1].refreshToken);
};
