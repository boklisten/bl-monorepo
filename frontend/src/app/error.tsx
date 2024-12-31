"use client"; // Error boundaries must be Client Components

import ErrorBoundary from "@frontend/components/ErrorBoundary";

export default function RootErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return <ErrorBoundary error={error} withLogo href={"/"} />;
}