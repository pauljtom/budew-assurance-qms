import type { Customer } from '../models/models';

export const initialCustomers: Customer[] = [
  {
    customerID: 'C-1001',
    firstName: 'John',
    lastName: 'Smith',
    addresses: [
      {
        street: '2 Frigate Crescent',
        city: 'Cape Town',
        suburb: 'Fish Hoek',
        postalCode: '7896',
      },
    ],
  },
  {
    customerID: 'C-1002',
    firstName: 'Sarah',
    lastName: 'Jacobs',
    addresses: [
      {
        street: '18 Oak Avenue',
        city: 'Cape Town',
        suburb: 'Claremont',
        postalCode: '7708',
      },
    ],
  },
  {
    customerID: 'C-1003',
    firstName: 'Thabo',
    lastName: 'Mokoena',
    addresses: [
      {
        street: '45 Protea Street',
        city: 'Johannesburg',
        suburb: 'Rosebank',
        postalCode: '2196',
      },
    ],
  },
  {
    customerID: 'C-1004',
    firstName: 'Priya',
    lastName: 'Naidoo',
    addresses: [
      {
        street: '7 Palm Road',
        city: 'Durban',
        suburb: 'Umhlanga',
        postalCode: '4319',
      },
    ],
  },
  {
    customerID: 'C-1005',
    firstName: 'David',
    lastName: 'Botha',
    addresses: [
      {
        street: '32 Jacaranda Lane',
        city: 'Pretoria',
        suburb: 'Hatfield',
        postalCode: '0083',
      },
    ],
  },
];
