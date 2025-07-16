import { AccessToken } from "@boklisten/backend/shared/token/access-token";
import { decodeToken } from "react-jwt";

import { add, get } from "@/api/storage";
import BL_CONFIG from "@/utils/bl-config";

const accessTokenName = BL_CONFIG.token.accessToken;
const refreshTokenName = BL_CONFIG.token.refreshToken;

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
