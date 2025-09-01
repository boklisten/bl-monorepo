"use client";
import { CustomerItemType } from "@boklisten/backend/shared/customer-item/customer-item-type";
import { MessageMethod } from "@boklisten/backend/shared/message/message-method/message-method";
import { Grid } from "@mui/material";
import { useState } from "react";

import CustomerItemTypePicker from "@/components/admin/communication/CustomerItemTypePicker";
import DeadlinePicker from "@/components/admin/communication/DeadlinePicker";
import EmailTemplatePicker from "@/components/admin/communication/EmailTemplatePicker";
import MessageMethodPicker from "@/components/admin/communication/MessageMethodPicker";
import MultiBranchPicker from "@/components/admin/communication/MultiBranchPicker";
import SendButton from "@/components/admin/communication/SendButton";
import SMSTextPicker from "@/components/admin/communication/SMSTextPicker";

export default function Reminders() {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [customerItemType, setCustomerItemType] =
    useState<CustomerItemType | null>(null);
  const [branchIDs, setBranchIDs] = useState<string[]>([]);
  const [messageMethod, setMessageMethod] = useState<MessageMethod | null>(
    null,
  );
  const [emailTemplateId, setEmailTemplateId] = useState<string | null>(null);
  const [smsText, setSmsText] = useState<string | null>(null);

  const hasValidConfiguration =
    deadline !== null &&
    customerItemType !== null &&
    branchIDs.length > 0 &&
    messageMethod !== null;

  return (
    <Grid container spacing={2} direction="column" width={318}>
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
      <Grid container sx={{ justifyContent: "space-between" }}>
        <CustomerItemTypePicker
          onChange={(newCustomerItemType) => {
            setCustomerItemType(newCustomerItemType);
          }}
        />
        <MessageMethodPicker
          onChange={(newMessageMethod) => {
            setMessageMethod(newMessageMethod);
            if (newMessageMethod === MessageMethod.SMS) {
              setEmailTemplateId(null);
            } else {
              setSmsText(null);
            }
          }}
        />
      </Grid>
      {hasValidConfiguration &&
        (messageMethod === MessageMethod.SMS ? (
          <SMSTextPicker
            onChange={(newSmsText) => {
              setSmsText(newSmsText);
            }}
          />
        ) : (
          <EmailTemplatePicker
            onChange={(newEmailTemplateId) => {
              setEmailTemplateId(newEmailTemplateId);
            }}
          />
        ))}
      {hasValidConfiguration && (
        <SendButton
          deadline={deadline}
          customerItemType={customerItemType}
          branchIDs={branchIDs}
          messageMethod={messageMethod}
          emailTemplateId={emailTemplateId}
          smsText={smsText}
        />
      )}
    </Grid>
  );
}
