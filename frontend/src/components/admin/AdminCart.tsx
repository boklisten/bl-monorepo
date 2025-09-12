"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Stack } from "@mantine/core";
import { useState } from "react";

import RapidHandoutDetails from "@/components/RapidHandoutDetails";
import UserDetailSearchField from "@/components/search/UserDetailSearchField";
import UserProfileButton from "@/components/search/UserProfileButton";

export default function AdminCart() {
  const [customer, setCustomer] = useState<UserDetail | null>(null);
  return (
    <Stack>
      <UserDetailSearchField
        onSelectedResult={(userDetail) => {
          setCustomer(userDetail);
        }}
      />
      {customer && <UserProfileButton userDetail={customer} />}
      {customer && <RapidHandoutDetails customer={customer} />}
    </Stack>
  );
}
