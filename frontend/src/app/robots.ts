import type { MetadataRoute } from "next";

import { isProduction } from "@/shared/utils/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProduction()
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
