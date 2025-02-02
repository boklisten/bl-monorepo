"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export default function ReactQueryClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000,
            },
          },
        })
      }
    >
      {children}
    </QueryClientProvider>
  );
}
