import { CustomerItemType } from "@boklisten/backend/shared/customer-item/customer-item-type";
import {
  MessageMethod,
  messageMethodToString,
} from "@boklisten/backend/shared/message/message-method/message-method";
import { Email, Sms } from "@mui/icons-material";
import { Alert, AlertTitle, Button, Collapse } from "@mui/material";
import { useEffect, useState } from "react";

import ConfirmSendReminderDialog from "@/components/admin/communication/ConfirmSendReminderDialog";
import useApiClient from "@/utils/api/useApiClient";

export default function SendButton({
  deadline,
  customerItemType,
  branchIDs,
  messageMethod,
  emailTemplateId,
  smsText,
}: {
  deadline: Date;
  customerItemType: CustomerItemType;
  branchIDs: string[];
  messageMethod: MessageMethod;
  emailTemplateId: string | null;
  smsText: string | null;
}) {
  const apiClient = useApiClient();
  const [confirmSendDialogOpen, setConfirmSendDialogOpen] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // hide alerts on change
  useEffect(() => {
    setSuccess(null);
    setRecipientCount(null);
  }, [
    branchIDs,
    deadline,
    customerItemType,
    messageMethod,
    emailTemplateId,
    smsText,
  ]);

  return (
    <>
      <Collapse
        in={recipientCount === 0 || success === true || success === false}
      >
        {recipientCount === 0 && (
          <Alert severity={"warning"}>
            Fant ingen kunder med valgte innstillinger
          </Alert>
        )}
        {success === true && (
          <Alert severity={"success"}>
            <AlertTitle>Påminnelse sendt</AlertTitle>
            Husk å sjekke status hos{" "}
            {messageMethod === "sms" ? "Twilio" : "SendGrid"} for å bekrefte at
            påminnelsen har kommet frem
          </Alert>
        )}
        {success === false && (
          <Alert severity={"error"}>
            Noe gikk galt under utsendingen av påminnelsen. Vennligst ta kontakt
            med administrator
          </Alert>
        )}
      </Collapse>
      <Button
        disabled={
          messageMethod === MessageMethod.SMS
            ? smsText === null || smsText.length === 0
            : emailTemplateId === null || emailTemplateId.length === 0
        }
        loading={loading}
        variant={"contained"}
        color={"primary"}
        endIcon={messageMethod === "sms" ? <Sms /> : <Email />}
        onClick={async () => {
          setSuccess(null);
          setRecipientCount(null);
          setLoading(true);
          try {
            const response = await apiClient.reminders.count_recipients
              .$post({
                deadlineISO: deadline.toISOString(),
                customerItemType,
                branchIDs,
                emailTemplateId,
                smsText,
              })
              .unwrap();
            setRecipientCount(response.recipientCount);
            if (response.recipientCount > 0) {
              setConfirmSendDialogOpen(true);
            }
          } catch {
            setSuccess(false);
          }
          setLoading(false);
        }}
      >
        Send {messageMethodToString(messageMethod)}
      </Button>
      <ConfirmSendReminderDialog
        recipientCount={recipientCount ?? 0}
        messageMethod={messageMethod}
        open={confirmSendDialogOpen}
        onAbort={() => {
          setLoading(false);
          setConfirmSendDialogOpen(false);
        }}
        onConfirm={async () => {
          setConfirmSendDialogOpen(false);
          try {
            const response = await apiClient.reminders.send
              .$post({
                deadlineISO: deadline.toISOString(),
                customerItemType,
                branchIDs,
                emailTemplateId,
                smsText,
              })
              .unwrap();
            setSuccess(response.success);
          } catch {
            setSuccess(false);
          }
          setLoading(false);
        }}
      />
    </>
  );
}
