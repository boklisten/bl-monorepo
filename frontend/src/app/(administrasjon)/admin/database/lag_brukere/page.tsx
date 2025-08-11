"use client";
import { useMutation } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";

import AuthGuard from "@/components/common/AuthGuard";
import UploadCSVFile from "@/components/UploadCSVFile";
import useApiClient from "@/utils/api/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

interface UserCandidate {
  name: string;
  phone: string;
  email: string;
  branchName: string;
  address?: string | null | undefined;
  postalCode?: string | null | undefined;
  postalCity?: string | null | undefined;
  dob?: string | number | null | undefined;
}

export default function CreateUsersPage() {
  const notifications = useNotifications();
  const client = useApiClient();
  const createUsersMutation = useMutation({
    mutationFn: (userCandidates: UserCandidate[]) =>
      client.users.create.$post({ userCandidates }).unwrap(),
    onSuccess: () =>
      notifications.show("Brukerne ble lastet opp!", SUCCESS_NOTIFICATION),
    onError: () =>
      notifications.show("Klarte ikke laste opp brukere!", ERROR_NOTIFICATION),
  });

  return (
    <AuthGuard requiredPermission={"admin"}>
      <UploadCSVFile
        label={"Last opp brukere"}
        requiredHeaders={["name", "phone", "email", "branchName"] as const}
        optionalHeaders={
          ["address", "postalCode", "postalCity", "dob"] as const
        }
        // fixme: bad csv upload typing
        onUpload={(data) => {
          console.log(data);
          createUsersMutation.mutate(data as UserCandidate[]);
        }}
      />
    </AuthGuard>
  );
}
