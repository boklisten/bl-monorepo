export interface Location {
  name: string;
  latitude?: string;
  longitude?: string;
  address?: {
    street: string;
    postalCity: string;
    postalCode: string;
    country?: string;
  };
  description: string;
}
