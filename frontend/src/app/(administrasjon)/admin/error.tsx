"use client"; // Error boundaries must be Client Components

import ErrorBoundary from "@frontend/components/ErrorBoundary";

export default function AdminRootErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return <ErrorBoundary error={error} href={"/admin"} />;
}
