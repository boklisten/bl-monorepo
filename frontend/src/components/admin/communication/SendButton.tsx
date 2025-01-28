import { CustomerItemType } from "@boklisten/backend/shared/src/customer-item/customer-item-type";
import {
  MessageMethod,
  messageMethodToString,
} from "@boklisten/backend/shared/src/message/message-method/message-method";
import { Button } from "@mui/material";

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
  return (
    <Button
      disabled={
        messageMethod === MessageMethod.SMS
          ? smsText === null || smsText.length === 0
          : emailTemplateId === null || emailTemplateId.length === 0
      }
      variant={"contained"}
      color={"primary"}
      onClick={() => {
        console.log(
          deadline,
          customerItemType,
          branchIDs,
          messageMethod,
          emailTemplateId,
          smsText,
        );
      }}
    >
      Send {messageMethodToString(messageMethod)}
    </Button>
  );
}
