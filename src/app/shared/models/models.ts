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