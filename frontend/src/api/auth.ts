import {
  haveAccessToken,
  removeTokens,
  getAccessTokenBody,
} from "@frontend/api/token";
import { UserPermission } from "@shared/permission/user-permission";

export const isLoggedIn = () => haveAccessToken();

export const logout = () => removeTokens();

export const getUserPermission = () => {
  if (isLoggedIn()) {
    try {
      getAccessTokenBody();
    } catch (error) {
      logout();
      throw error;
    }

    return getAccessTokenBody().permission;
  }
  return "customer";
};

export const isAdmin = (): boolean => {
  let permission: UserPermission;

  try {
    permission = getUserPermission();
  } catch (error) {
    console.error(error);
    return false;
  }

  return permission === "admin";
};

export const isManager = (): boolean => {
  let permission: UserPermission;

  try {
    permission = getUserPermission();
  } catch (error) {
    console.error(error);
    return false;
  }

  return isAdmin() || permission === "manager";
};

export const isEmployee = (): boolean => {
  let permission: UserPermission;

  try {
    permission = getUserPermission();
  } catch (error) {
    console.error(error);
    return false;
  }

  return isAdmin() || isManager() || permission === "employee";
};
