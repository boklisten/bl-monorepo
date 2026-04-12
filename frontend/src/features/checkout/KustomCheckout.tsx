import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/shared/utils/publicApiClient";

export default function KustomCheckout({ kustomOrderId }: { kustomOrderId: string }) {
  const { data } = useQuery(
    publicApi.kustomCheckout.getSnippet.queryOptions({
      params: { kustomOrderId },
    }),
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !data) return;

    el.innerHTML = data;

    Array.from(el.querySelectorAll("script")).forEach((original) => {
      const replacement = document.createElement("script");
      Array.from(original.attributes).forEach((attr) =>
        replacement.setAttribute(attr.name, attr.value),
      );
      replacement.textContent = original.textContent;
      original.parentNode?.replaceChild(replacement, original);
    });
  }, [data]);

  return <div ref={ref} />;
}
