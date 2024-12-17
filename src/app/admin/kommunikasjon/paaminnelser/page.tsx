"use client";
import { CustomerItemType } from "@boklisten/bl-model";
import { MessageMethod } from "@boklisten/bl-model/message/message-method/message-method";
import { Grid2, Typography } from "@mui/material";
import { PageContainer } from "@toolpad/core";
import { useState } from "react";

import CustomerItemTypePicker from "@/components/admin/communication/CustomerItemTypePicker";
import DeadlinePicker from "@/components/admin/communication/DeadlinePicker";
import MessageMethodPicker from "@/components/admin/communication/MessageMethodPicker";
import MultiBranchPicker from "@/components/admin/communication/MultiBranchPicker";

export default function RemindersPage() {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [customerItemType, setCustomerItemType] =
    useState<CustomerItemType | null>(null);
  const [branchIDs, setBranchIDs] = useState<string[]>([]);
  const [messageMethod, setMessageMethod] = useState<MessageMethod | null>(
    null,
  );

  return (
    <PageContainer>
      <Grid2 container spacing={2} direction="column">
        <MultiBranchPicker
          onChange={(newBranchIDs) => {
            setBranchIDs(newBranchIDs);
          }}
        />
        <DeadlinePicker
          onChange={(newDeadline) => {
            setDeadline(newDeadline);
          }}
        />
        <Grid2 container sx={{ justifyContent: "space-between" }} width={318}>
          <CustomerItemTypePicker
            onChange={(newCustomerItemType) => {
              setCustomerItemType(newCustomerItemType);
            }}
          />
          <MessageMethodPicker
            onChange={(newMessageMethod) => {
              setMessageMethod(newMessageMethod);
            }}
          />
        </Grid2>
        <Typography>Schools: {branchIDs.join(", ")}</Typography>
        <Typography>Deadline: {String(deadline ?? "")}</Typography>
        <Typography>CustomerItemType: {customerItemType ?? ""}</Typography>
        <Typography>MessageMethod: {messageMethod ?? ""}</Typography>
      </Grid2>
    </PageContainer>
  );
}
