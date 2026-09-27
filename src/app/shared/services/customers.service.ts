import { Injectable } from '@angular/core';
import { defer, of } from 'rxjs';
import type { Customer } from '../models/models';
import { initialCustomers } from '../data/customers';

/** In-memory repository; customer changes last until the browser is refreshed. */
@Injectable({ providedIn: 'root' })
export class CustomersService {
  private customers = [...initialCustomers];

  load() {
    return defer(() => of([...this.customers]));
  }

  create(customer: Customer) {
    return defer(() => {
      this.customers = [...this.customers, customer];
      return of([...this.customers]);
    });
  }

  delete(customer: Customer) {
    return defer(() => {
      if (!this.customers.some((item) => item.customerID === customer.customerID))
        throw new Error('This customer no longer exists.');
      this.customers = this.customers.filter((item) => item.customerID !== customer.customerID);
      return of([...this.customers]);
    });
  }
}
