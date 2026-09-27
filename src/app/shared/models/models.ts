// Customer

export interface Customer {
    firstName: string;
    lastName: string;
    addresses: Address[];
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
  Accepted = 'Accepted'
}

export interface Quote {
    quoteID: string;
    amount: number;
    status: QuoteStatus;
    customer: Customer; 
    createdDate: Date;
}