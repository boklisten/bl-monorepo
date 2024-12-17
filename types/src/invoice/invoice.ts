import { BlDocument } from "../bl-document/bl-document";
import { CustomerItem } from "../customer-item/customer-item";
import { UserDetail } from "../user/user-detail/user-detail";
import { CustomerItemType } from "../customer-item/customer-item-type";

export class Invoice extends BlDocument {
  duedate: Date;
  type?: CustomerItemType;
  customerHavePayed?: boolean;
  toDebtCollection?: boolean;
  toCreditNote?: boolean;
  toLossNote?: boolean;
  branch?: string;
  customerItemPayments: {
    customerItem?: string;
    productNumber?: number;
    item: string;
    title: string;
    numberOfItems: number;
    type: CustomerItemType;
    cancel?: boolean;
    payment: {
      unit: number; // price per unit without vat
      gross: number;
      net: number;
      vat: number;
      discount: number; // in percentage
    };
  }[];
  customerInfo: {
    userDetail?: string;
    companyDetail?: string;
    customerNumber?: string;
    name: string;
    branchName?: string;
    organizationNumber?: string;
    email: string;
    phone: string;
    dob?: Date;
    postal: {
      address: string;
      city: string;
      code: string;
      country: string;
    };
  };
  payment: {
    total: {
      // amounts are a sum of all items
      gross: number;
      net: number;
      vat: number;
      discount: number; // in percentage
    };
    fee?: {
      unit: number; // fee per unit without vat
      gross: number;
      net: number;
      vat: number;
      discount: number; // in percentage
    };
    totalIncludingFee: number; // total.gross + fee.gross
  };
  ourReference?: string;
  invoiceId?: string; // ex. 201810000
  reference?: string; // ex. 'Not delivered books in time'
}
