"use client";
import RapidHandoutDetails from "@frontend/components/RapidHandoutDetails";
import UserDetailSearchField from "@frontend/components/search/UserDetailSearchField";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { PageContainer } from "@toolpad/core";
import { useState } from "react";

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
