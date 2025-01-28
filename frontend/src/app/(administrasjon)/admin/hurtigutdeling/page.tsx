"use client";
import { UserDetail } from "@boklisten/backend/shared/src/user/user-detail/user-detail";
import { PageContainer } from "@toolpad/core";
import { useState } from "react";

import RapidHandoutDetails from "@/components/RapidHandoutDetails";
import UserDetailSearchField from "@/components/search/UserDetailSearchField";

export default function HandoutPage() {
  const [customer, setCustomer] = useState<UserDetail | null>(null);
  return (
    <PageContainer>
      <UserDetailSearchField
        onSelectedResult={(userDetail) => {
          setCustomer(userDetail);
        }}
      />
      {customer && <RapidHandoutDetails customer={customer} />}
    </PageContainer>
  );
}
