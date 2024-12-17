import { BlDocument } from "../bl-document/bl-document";
import { MessageType } from "./message-type/message-type";
import { MessageSubtype } from "./message-subtype/message-subtype";
import { MessageMethod } from "./message-method/message-method";
import { MessageReminderInfo } from "./message-info/message-reminder-info";
import { MessageReceiptInfo } from "./message-info/message-receipt-info";
import { TextBlock } from "../text-block/text-block";
import { SendgridEvent } from "./message-sendgrid-event/message-sendgrid-event";

/*
 * A message is something that is sent to a customer
 * for example a reminder about delivering items.
 * It can be a email, direct message, sms, or all.
 */
export class Message extends BlDocument {
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
  smsEvents?: any[]; // sms events for this message
  htmlContent?: string; // html content for generic messages
  customContent?: string; // custom content to use when not using sequence number
  subject?: string; // subject for generic html
  // the message can be supported with text blocks
  textBlocks?: TextBlock[];
}
