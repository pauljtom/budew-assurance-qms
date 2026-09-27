// Customer

export interface Customer {
  customerID: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  nationality?: Country;
  university?: University;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface University {
  name: string;
  website: string;
}

export interface Address {
  street: string;
  city: string;
  suburb: string;
  postalCode: string;
}

// Quotes

export enum QuoteStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Expired = 'Expired',
  Accepted = 'Accepted',
}

export interface Quote {
  quoteID: string;
  amount: number;
  status: QuoteStatus;
  customer: Customer;
  createdDate: Date;
}
