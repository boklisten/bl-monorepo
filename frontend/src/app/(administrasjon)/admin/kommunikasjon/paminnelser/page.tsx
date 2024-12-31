"use client";
import CustomerItemTypePicker from "@frontend/components/admin/communication/CustomerItemTypePicker";
import DeadlinePicker from "@frontend/components/admin/communication/DeadlinePicker";
import EmailTemplatePicker from "@frontend/components/admin/communication/EmailTemplatePicker";
import MessageMethodPicker from "@frontend/components/admin/communication/MessageMethodPicker";
import MultiBranchPicker from "@frontend/components/admin/communication/MultiBranchPicker";
import SendButton from "@frontend/components/admin/communication/SendButton";
import SMSTextPicker from "@frontend/components/admin/communication/SMSTextPicker";
import { Grid2 } from "@mui/material";
import { CustomerItemType } from "@shared/customer-item/customer-item-type";
import { MessageMethod } from "@shared/message/message-method/message-method";
import { useState } from "react";

export default function RemindersPage() {
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
    <Grid2 container spacing={2} direction="column" width={318}>
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
      <Grid2 container sx={{ justifyContent: "space-between" }}>
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
      </Grid2>
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
    </Grid2>
  );
}
