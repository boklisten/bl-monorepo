"use client";
import CustomerItemTypePicker from "@frontend/components/admin/communication/CustomerItemTypePicker";
import DeadlinePicker from "@frontend/components/admin/communication/DeadlinePicker";
import MessageMethodPicker from "@frontend/components/admin/communication/MessageMethodPicker";
import MultiBranchPicker from "@frontend/components/admin/communication/MultiBranchPicker";
import { Grid2, Typography } from "@mui/material";
import { CustomerItemType } from "@shared/customer-item/customer-item-type";
import { MessageMethod } from "@shared/message/message-method/message-method";
import { PageContainer } from "@toolpad/core";
import { useState } from "react";

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
