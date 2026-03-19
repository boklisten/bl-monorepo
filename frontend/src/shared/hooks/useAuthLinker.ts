import useAuth from "@/shared/hooks/useAuth";
import BL_CONFIG from "@/shared/utils/bl-config";
import { useLocation, useNavigate } from "@tanstack/react-router";

export default function useAuthLinker() {
  const { search, searchStr } = useLocation();
  const navigate = useNavigate();
  const { isLoading, isLoggedIn } = useAuth();

  function redirectToBlAdmin(path: string, retainHistory?: boolean) {
    if (isLoading) return;

    const url = new URL(`${BL_CONFIG.blAdmin.basePath}${path}${searchStr}`);

    if (isLoggedIn) {
      const accessToken = localStorage.getItem(BL_CONFIG.token.accessToken);
      const refreshToken = localStorage.getItem(BL_CONFIG.token.refreshToken);
      if (accessToken && refreshToken) {
        url.searchParams.append("refresh_token", refreshToken);
        url.searchParams.append("access_token", accessToken);
      }
    }
    void navigate({ href: url.toString(), replace: !retainHistory });
  }

  function redirectToCaller() {
    const { localStorageKeys } = BL_CONFIG.login;

    const caller = search.caller ?? localStorage.getItem(localStorageKeys.caller);

    const redirect = search.redirect ?? localStorage.getItem(localStorageKeys.redirect) ?? "";

    localStorage.removeItem(localStorageKeys.caller);
    localStorage.removeItem(localStorageKeys.redirect);

    if (!caller) {
      void navigate({ to: `/${redirect}` });
      return;
    }

    if (caller !== "bl-admin") {
      throw new Error("Invalid caller");
    }
    redirectToBlAdmin(`auth/gateway?redirect=${redirect}`);
  }

  return { redirectToBlAdmin, redirectToCaller };
}
