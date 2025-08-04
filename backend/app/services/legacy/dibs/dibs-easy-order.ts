import { DibsEasyItem } from "#types/dibs-easy-item";

export class DibsEasyOrder {
  order: {
    reference: string; //the order-id of the order
    items: DibsEasyItem[]; //the items of the order
    amount: number; //the total grossAmount of all items
    currency: "NOK" | "SEK";
  };

  // @ts-expect-error fixme: auto ignored
  checkout: {
    url: string; //where the checkout is located, and where to redirect after 3-D secure are done
    termsUrl: string;
    ShippingCountries: {
      countryCode: "NOR" | "SWE"; //the country in which to ship the order
    }[];
    merchantHandlesConsumerData?: boolean; // true if autofill should be used
    consumer?: {
      email: string; // email of the customer
      shippingAddress: {
        // the customers shipping address
        addressLine1: string;
        addressLine2: string;
        postalCode: string;
        city: string;
        country: string;
      };
      phoneNumber: {
        prefix: string; // example: +47
        number: string; // example: 123456789
      };
      privatePerson: {
        firstName: string;
        lastName: string;
      };
    };
  };

  constructor() {
    this.order = {
      reference: "",
      items: [],
      amount: 0,
      currency: "NOK",
    };
  }
}
