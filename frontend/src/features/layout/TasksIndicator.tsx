import { Indicator } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import useApiClient from "@/shared/hooks/useApiClient";
import type { ReactNode } from "react";

export default function TasksIndicator({ children }: { children: ReactNode }) {
  const client = useApiClient();
  const {
    data: userDetail,
    isLoading: isLoadingUserDetail,
    isError: isErrorUserDetail,
  } = useQuery({
    queryKey: [client.v2.user_details.$url()],
    queryFn: () => client.v2.user_details.me.$get().unwrap(),
  });

  const taskCount =
    isLoadingUserDetail || isErrorUserDetail || !userDetail?.tasks
      ? 0
      : (userDetail.tasks.confirmDetails ? 1 : 0) + (userDetail.tasks.signAgreement ? 1 : 0);

  if (taskCount === 0) return <>{children}</>;
  return (
    <Indicator color={"red"} disabled={taskCount === 0}>
      {children}
    </Indicator>
  );
}
