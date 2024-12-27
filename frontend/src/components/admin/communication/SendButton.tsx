import { Button } from "@mui/material";
import { CustomerItemType } from "@shared/customer-item/customer-item-type";
import {
  MessageMethod,
  messageMethodToString,
} from "@shared/message/message-method/message-method";

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
