const BL_CONFIG = {
  api: {
    basePath: import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/",
  },
  blAdmin: {
    basePath: import.meta.env["VITE_BL_ADMIN_URL"] ?? "http://localhost:8080/",
  },
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
