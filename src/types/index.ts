export interface PropertySale {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  saleDate: Date;
  sqft: number;
  propertyType: string;
}

export interface Filters {
  priceRange: [number, number];
  sqftRange: [number, number];
  propertyType: string | 'all';
}
