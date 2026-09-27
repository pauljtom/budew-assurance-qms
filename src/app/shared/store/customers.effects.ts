import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { catchError, concatMap, map, of } from 'rxjs';
import { CustomersService } from '../services/customers.service';
import {
  updateCustomer,
  updateCustomerSuccess,
  addCustomer,
  addCustomerSuccess,
  customersFailure,
  deleteCustomer,
  deleteCustomerSuccess,
  loadCustomers,
  loadCustomersSuccess,
} from './customers.store';

@Injectable()
export class CustomersEffects implements OnInitEffects {
  private actions = inject(Actions);
  private service = inject(CustomersService);

  ngrxOnInitEffects() {
    return loadCustomers();
  }

  load = createEffect(() =>
    this.actions.pipe(
      ofType(loadCustomers),
      concatMap(() =>
        this.service.load().pipe(
          map((customers) => loadCustomersSuccess({ customers })),
          catchError((error: Error) => of(customersFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  mutate = createEffect(() =>
    this.actions.pipe(
      ofType(addCustomer, updateCustomer, deleteCustomer),
      concatMap((action) => {
        const request =
          action.type === addCustomer.type
            ? this.service.create(action.customer)
            : action.type === updateCustomer.type
              ? this.service.update(action.customer)
              : this.service.delete(action.customer);
        return request.pipe(
          map((customers) =>
            action.type === addCustomer.type
              ? addCustomerSuccess({ customers, customer: action.customer })
              : action.type === updateCustomer.type
                ? updateCustomerSuccess({ customers, customer: action.customer })
                : deleteCustomerSuccess({ customers }),
          ),
          catchError((error: Error) => of(customersFailure({ error: error.message }))),
        );
      }),
    ),
  );
}
