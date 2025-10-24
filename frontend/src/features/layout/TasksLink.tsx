import { Badge, NavLink } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import useApiClient from "@/shared/hooks/useApiClient";

export default function TasksLink() {
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
      : (userDetail.tasks.confirmDetails ? 1 : 0) +
        (userDetail.tasks.signAgreement ? 1 : 0);

  if (taskCount === 0) return null;
  return (
    <NavLink
      label={"Oppgaver"}
      description={`Du har ${taskCount} ${taskCount === 1 ? "oppgave" : "oppgaver"} som må fullføres.`}
      href={"/oppgaver"}
      leftSection={
        <Badge color={"red"} circle>
          {taskCount}
        </Badge>
      }
      component={Link}
      color={"red"}
      active
      variant={"subtle"}
      onClick={close}
    />
  );
}
