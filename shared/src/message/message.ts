import { BlDocument } from "@shared/bl-document/bl-document.js";
import { MessageReceiptInfo } from "@shared/message/message-info/message-receipt-info.js";
import { MessageReminderInfo } from "@shared/message/message-info/message-reminder-info.js";
import { MessageMethod } from "@shared/message/message-method/message-method.js";
import { SendgridEvent } from "@shared/message/message-sendgrid-event/message-sendgrid-event.js";
import { MessageSubtype } from "@shared/message/message-subtype/message-subtype.js";
import { MessageType } from "@shared/message/message-type/message-type.js";
import { TextBlock } from "@shared/text-block/text-block.js";

/*
 * A message is something that is sent to a customer
 * for example a reminder about delivering items.
 * It can be a email, direct message, sms, or all.
 */
export interface Message extends BlDocument {
  // what type of message, ex 'reminder', 'alert', 'direct'
  messageType: MessageType;
  // what type of subtype, ex: 'partly-payment', 'rent'
  messageSubtype: MessageSubtype;
  // what type of method should be used to send message ex: 'email', 'sms'
  messageMethod: MessageMethod;
  // the id of the customer
  customerId: string;
  // if there are more than one message of this type and subtype
  sequenceNumber?: number;
  // if employee should be known to customer, set it here
  employeeId?: string;
  // info based on the specific message type
  info?: MessageReminderInfo | MessageReceiptInfo;
  events?: SendgridEvent[]; // events for this message, can be sendgrid events
  smsEvents?: unknown[]; // sms events for this message
  htmlContent?: string; // html content for generic messages
  customContent?: string; // custom content to use when not using sequence number
  subject?: string; // subject for generic html
  // the message can be supported with text blocks
  textBlocks?: TextBlock[];
}
