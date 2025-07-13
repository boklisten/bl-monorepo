import * as process from "node:process";

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env["NEXT_PUBLIC_APP_ENV"] === "production"
        ? {
            userAgent: "*",
            allow: "/",
            disallow: "/admin/",
          }
        : {
            userAgent: "*",
            disallow: "/",
          },
  };
}
