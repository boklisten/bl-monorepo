export interface EmailOrder {
  id: string;
  showDeadline?: boolean;
  showPrice?: boolean;
  showStatus?: boolean;
  showSubject?: boolean;
  itemAmount: string;
  totalAmount: string;
  currency?: string;
  loan?: boolean;
  items: {
    title: string;
    status: string;
    subject?: string | null;
    deadline?: string | null;
    price?: string | null;
    handout?: boolean | null;
  }[];
  showDelivery?: boolean;
  delivery?: {
    method: "bring";
    trackingNumber: string;
    address: string;
    estimatedDeliveryDate: string | null;
    amount: string | null;
    currency: string | null;
  };
  showPayment?: boolean;
  payment: {
    total: string;
    currency: string;
    taxRate?: string;
    taxAmount?: string;
    payments?: {
      method: string;
      amount: string;
      cardInfo?: string;
      taxAmount: string;
      paymentId: string;
      status: string;
      creationTime: string;
    }[];
  };
}

export interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  contentId: string;
}

export interface EmailTextBlock {
  text: string;
  warning?: boolean;
  alert?: boolean;
  regular?: boolean;
  secondary?: boolean;
}
export declare interface EmailSetting {
  userId: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  userFullName?: string;
  blMessageId?: string;
  attachments?: EmailAttachment[];
  textBlocks?: EmailTextBlock[];
}
export interface EmailUser {
  id: string;
  dob: string;
  name: string;
  email: string;
  address: string;
}
