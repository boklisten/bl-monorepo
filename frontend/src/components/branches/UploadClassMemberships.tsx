import { useMutation } from "@tanstack/react-query";
import { useDialogs } from "@toolpad/core";
import { useState } from "react";

import UploadCSVFile from "@/components/UploadCSVFile";
import useApiClient from "@/utils/api/useApiClient";

export default function UploadClassMemberships() {
  const client = useApiClient();
  const dialogs = useDialogs();
  const [loading, setLoading] = useState(false);

  const uploadClassMembership = useMutation({
    mutationFn: async (membershipData: { branch: string; phone: string }[]) => {
      setLoading(true);
      return await client.v2.branches.memberships
        .$post({ membershipData })
        .unwrap();
    },
    onSettled: () => setLoading(false),
    onSuccess: () =>
      dialogs.alert(`X ble lastet opp, fant ikke bla bla bla`, {
        title: "Opplasting av klassevalg var vellykket!",
      }),
    onError: () =>
      dialogs.alert("Opplasting av klassevalg feilet!", {
        title: "Feilmelding",
      }),
  });
  return (
    <UploadCSVFile
      loading={loading}
      label={"Last opp klassevalg"}
      allowedHeaders={["phone", "branch"] as const}
      onUpload={uploadClassMembership.mutate}
    />
  );
}
