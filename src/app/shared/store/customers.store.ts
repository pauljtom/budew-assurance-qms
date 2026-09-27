import { createAction, createFeature, createReducer, on, props } from '@ngrx/store';
import type { Customer } from '../models/models';

export { initialCustomers } from '../data/customers';

export const loadCustomers = createAction('[Customers] Load Customers');
export const loadCustomersSuccess = createAction(
  '[Customers] Load Success',
  props<{ customers: Customer[] }>(),
);
export const addCustomer = createAction(
  '[Customers] Add Customer',
  props<{ customer: Customer }>(),
);
export const addCustomerSuccess = createAction(
  '[Customers] Add Success',
  props<{ customers: Customer[]; customer: Customer }>(),
);
export const updateCustomer = createAction(
  '[Customers] Update Customer',
  props<{ customer: Customer }>(),
);
export const updateCustomerSuccess = createAction(
  '[Customers] Update Success',
  props<{ customers: Customer[]; customer: Customer }>(),
);

export const deleteCustomer = createAction(
  '[Customers] Delete Customer',
  props<{ customer: Customer }>(),
);
export const deleteCustomerSuccess = createAction(
  '[Customers] Delete Success',
  props<{ customers: Customer[] }>(),
);
export const customersFailure = createAction('[Customers] Failure', props<{ error: string }>());

export const customersFeature = createFeature({
  name: 'customers',
  reducer: createReducer(
    { customers: [] as Customer[], loading: false, saving: false, error: null as string | null },
    on(loadCustomers, (state) => ({ ...state, loading: true, error: null })),
    on(addCustomer, updateCustomer, deleteCustomer, (state) => ({
      ...state,
      saving: true,
      error: null,
    })),
    on(loadCustomersSuccess, (state, { customers }) => ({ ...state, customers, loading: false })),
    on(
      addCustomerSuccess,
      updateCustomerSuccess,
      deleteCustomerSuccess,
      (state, { customers }) => ({
        ...state,
        customers,
        saving: false,
      }),
    ),
    on(customersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      saving: false,
      error,
    })),
  ),
});
