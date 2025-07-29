"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Stack } from "@mui/material";
import { useState } from "react";

import RapidHandoutDetails from "@/components/RapidHandoutDetails";
import SelectedUserChip from "@/components/search/SelectedUserChip";
import UserDetailSearchField from "@/components/search/UserDetailSearchField";

export default function AdminCart() {
  const [customer, setCustomer] = useState<UserDetail | null>(null);
  return (
    <>
      {!customer && (
        <UserDetailSearchField
          onSelectedResult={(userDetail) => {
            setCustomer(userDetail);
          }}
        />
      )}
      <Stack alignItems={"center"}>
        {customer && (
          <SelectedUserChip
            userDetail={customer}
            unSelect={() => setCustomer(null)}
          />
        )}
      </Stack>
      {customer && <RapidHandoutDetails customer={customer} />}
    </>
  );
}
