"use client";
import { Title } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import useAuthLinker from "@/hooks/useAuthLinker";

const CountdownToRedirect = ({
  seconds,
  path,
  shouldReplaceInHistory,
  shouldRedirectToCaller,
}: {
  seconds: number;
  path?: string;
  shouldReplaceInHistory?: boolean;
  shouldRedirectToCaller?: boolean;
}) => {
  const { redirectToCaller } = useAuthLinker();
  const [progress, setProgress] = useState(100);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, scrollTo] = useWindowScroll();

  useEffect(() => {
    scrollTo({ y: 0 });
  }, [scrollTo]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((previousProgress) => {
        if (previousProgress <= 0) {
          clearInterval(interval);

          return 0;
        }
        return previousProgress - 10 / seconds;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [path, router, seconds, shouldReplaceInHistory]);

  useEffect(() => {
    if (progress <= 0) {
      if (shouldRedirectToCaller) return redirectToCaller();
      if (path) {
        if (shouldReplaceInHistory) {
          // @ts-expect-error fixme: bad routing types
          router.replace(path);
        } else {
          // @ts-expect-error fixme: bad routing types
          router.push(path);
        }
      }
    }
  }, [
    progress,
    shouldReplaceInHistory,
    router,
    path,
    shouldRedirectToCaller,
    redirectToCaller,
  ]);

  return (
    <Title order={6} ta={"center"}>
      Du blir videresendt om {Math.ceil((progress / 100) * seconds)} sekunder...
    </Title>
  );
};

export default CountdownToRedirect;
