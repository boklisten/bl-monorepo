"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Stack } from "@mantine/core";
import { useState } from "react";

import RapidHandoutDetails from "@/features/rapid-handout/RapidHandoutDetails";
import UserDetailSearchField from "@/features/rapid-handout/UserDetailSearchField";
import UserProfileButton from "@/features/rapid-handout/UserProfileButton";

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
