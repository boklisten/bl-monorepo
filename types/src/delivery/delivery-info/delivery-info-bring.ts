export class DeliveryInfoBring {
  amount: number;
  estimatedDelivery: Date;
  taxAmount?: number;
  shipmentAddress?: {
    name: string;
    address: string;
    postalCode: string;
    postalCity: string;
  };
  facilityAddress?: {
    address: string;
    postalCode: string;
    postalCity: string;
  };
  trackingNumber?: string;
  to?: string;
  from?: string;
  bringId?: string;
  product?: string;
}
