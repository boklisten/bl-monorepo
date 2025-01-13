import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["src"],
  },
  // fixme: temporary redirects required while in tandem with bl-web / bl-admin
  async redirects() {
    return [
      {
        source: "/overleveringer",
        destination: "/matches",
        permanent: false,
      },
      {
        source: "/auth/login/forgot",
        destination: "/auth/forgot",
        permanent: false,
      },
      {
        source: "/auth/menu",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/auth/success",
        destination: "/",
        permanent: false,
      },
      {
        source: "/auth/social/failure",
        destination: "/auth/failure",
        permanent: false,
      },
      {
        source: "/auth/register/detail",
        destination: "/user-settings",
        permanent: false,
      },
      {
        source: "/u/edit",
        destination: "/user-settings",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
