const BL_CONFIG = {
  api: {
    basePath: process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:1337/",
  },
  blAdmin: {
    basePath:
      process.env["NEXT_PUBLIC_BL_ADMIN_URL"] ?? "http://localhost:8080/",
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
