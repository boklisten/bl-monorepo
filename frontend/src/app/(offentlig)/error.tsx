"use client"; // Error boundaries must be Client Components

import ErrorBoundary from "@/components/ErrorBoundary";

export default function PublicRootErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return <ErrorBoundary error={error} href={"/"} />;
}
