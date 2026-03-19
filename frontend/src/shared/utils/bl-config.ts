const BL_CONFIG = {
  token: {
    accessToken: "bl-access-token",
    refreshToken: "bl-refresh-token",
  },
  login: {
    localStorageKeys: {
      redirect: "bl-redirect",
      caller: "bl-caller",
    },
  },
} as const;

export default BL_CONFIG;
