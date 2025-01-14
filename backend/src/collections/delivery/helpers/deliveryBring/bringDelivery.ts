export class BringDelivery {
  // @ts-expect-error fixme: auto ignored
  frompostalcode: string; //from postal code

  // @ts-expect-error fixme: auto ignored
  topostalcode: string; //to postal code

  // @ts-expect-error fixme: auto ignored
  fromcountry: string;

  // @ts-expect-error fixme: auto ignored
  tocountry: string;
  weight?: number; //the weight of the packet
  width?: number; //the width of the packet
  length?: number; //the length of the packet
  height?: number; //the height of the packet
  loadMeters?: number; //the loadMeters of the packet
  numberOfPallets?: number; //number of pallets for this packet
  NonStackable?: boolean; //is the pallet non stackable?
  date?: string; //the shipping date, when we deliver the packet to bring
  time?: string; //the shipping time, only affected is Bring couriers
  clientUrl?: string; //the url of bl-web
  edi?: boolean; //flag that tells if the parcell will be using edi
  postingAtPostOffice?: boolean; //if the shipment is delivered by us at the postOffice
  additional?: string[]; //additional services
  priceAdjustments?: string; //see bring developer site for price adjustments
  pid?: string; //public id
  product?: string; //the product to get information about, ex: servicepakke
  customerNumber?: string; //requires user authentication, special info for the user
  language?: string; //what language to use ex: no, en, se
  volumeSpecial?: boolean; //special volume if the shape is of a special shape
}
