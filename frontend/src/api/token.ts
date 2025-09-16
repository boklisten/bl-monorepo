import { AccessToken } from "@boklisten/backend/shared/access-token";
import { decodeToken } from "react-jwt";

import BL_CONFIG from "@/utils/bl-config";

const accessTokenName = BL_CONFIG.token.accessToken;
const refreshTokenName = BL_CONFIG.token.refreshToken;

export const addAccessToken = (value: string): void => {
  if (!value || value.length <= 0) {
    throw new Error("provided value is empty or undefined");
  }
  localStorage.setItem(accessTokenName, value);
};

export const addRefreshToken = (value: string): void => {
  if (!value || value.length <= 0) {
    throw new Error("provided value is empty or undefined");
  }
  localStorage.setItem(refreshTokenName, value);
};

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(accessTokenName);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(refreshTokenName);
  } catch {
    return null;
  }
};

export const getAccessTokenBody = () => {
  const token = getAccessToken();
  if (!token) return null;

  let decodedToken;
  try {
    decodedToken = decodeToken(token);
  } catch (error) {
    throw new Error("accessToken is not valid: " + error);
  }

  return decodedToken as AccessToken;
};
