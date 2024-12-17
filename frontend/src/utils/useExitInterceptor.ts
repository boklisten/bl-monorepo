import { useEffect } from "react";

import useIsHydrated from "@/utils/useIsHydrated";

const useExitInterceptor = (preventExit: boolean) => {
  const hydrated = useIsHydrated();

  useEffect(() => {
    if (hydrated) {
      const onBeforeUnload = (event: BeforeUnloadEvent) => {
        if (preventExit) {
          event.preventDefault();
        }
      };

      window.addEventListener("beforeunload", onBeforeUnload);
      return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }
    return;
  }, [hydrated, preventExit]);
};

export default useExitInterceptor;
