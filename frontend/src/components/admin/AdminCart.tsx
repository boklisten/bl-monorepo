"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { useState } from "react";

import RapidHandoutDetails from "@/components/RapidHandoutDetails";
import SelectedUserChip from "@/components/search/SelectedUserChip";
import UserDetailSearchField from "@/components/search/UserDetailSearchField";

export default function AdminCart() {
  const [customer, setCustomer] = useState<UserDetail | null>(null);
  return (
    <>
      <UserDetailSearchField
        onSelectedResult={(userDetail) => {
          setCustomer(userDetail);
        }}
      />
      {customer && (
        <SelectedUserChip
          userDetail={customer}
          unSelect={() => setCustomer(null)}
        />
      )}
      {customer && <RapidHandoutDetails customer={customer} />}
    </>
  );
}
