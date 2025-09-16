"use client";
import { useMutation } from "@tanstack/react-query";

import UploadCSVFile from "@/shared/components/UploadCSVFile";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

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

export default function CreateUsers() {
  const client = useApiClient();
  const createUsersMutation = useMutation({
    mutationFn: (userCandidates: UserCandidate[]) =>
      client.users.create.$post({ userCandidates }).unwrap(),
    onSuccess: () => showSuccessNotification("Brukerne ble lastet opp!"),
    onError: () => showErrorNotification("Klarte ikke laste opp brukere!"),
  });

  return (
    <UploadCSVFile
      label={"Last opp brukere"}
      requiredHeaders={["name", "phone", "email", "branchName"] as const}
      optionalHeaders={["address", "postalCode", "postalCity", "dob"] as const}
      // fixme: bad csv upload typing
      onUpload={(data) => {
        console.log(data);
        createUsersMutation.mutate(data as UserCandidate[]);
      }}
    />
  );
}
