import { createAction, createFeature, createReducer, on, props } from '@ngrx/store';
import type { Customer } from '../models/models';

export const initialCustomers: Customer[] = [
  {
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

export const addCustomer = createAction(
  '[Customers] Add Customer',
  props<{ customer: Customer }>(),
);

export const customersFeature = createFeature({
  name: 'customers',
  reducer: createReducer(
    { customers: initialCustomers },
    on(addCustomer, (state, { customer }) => ({
      ...state,
      customers: [...state.customers, customer],
    })),
  ),
});
