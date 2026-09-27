import { Injectable } from '@angular/core';
import { defer, of } from 'rxjs';
import { QuoteStatus, type Quote } from '../models/models';
import { initialCustomers } from '../data/customers';

export const initialQuotes: Quote[] = Object.values(QuoteStatus).map((status, index) => ({
  quoteID: `Q-100${index + 1}`,
  amount: [1250, 2800, 950, 4500, 1750, 3200][index],
  status,
  customer: initialCustomers[index % initialCustomers.length],
  createdDate: new Date(2026, 8, 20 + index),
}));

/** In-memory repository for the assessment; replace with HTTP calls for a backend. */
@Injectable({ providedIn: 'root' })
export class QuotesService {
  private quotes = [...initialQuotes];

  load() {
    return defer(() => of([...this.quotes]));
  }

  create(quote: Quote) {
    return defer(() => {
      if (this.quotes.some((item) => item.quoteID === quote.quoteID))
        throw new Error('A quote with this ID already exists.');
      this.quotes = [...this.quotes, quote];
      return of([...this.quotes]);
    });
  }

  update(quote: Quote) {
    return defer(() => {
      if (!this.quotes.some((item) => item.quoteID === quote.quoteID))
        throw new Error('This quote no longer exists.');
      this.quotes = this.quotes.map((item) => (item.quoteID === quote.quoteID ? quote : item));
      return of([...this.quotes]);
    });
  }

  updateCustomer(customer: Quote['customer']) {
    this.quotes = this.quotes.map((quote) =>
      quote.customer.customerID === customer.customerID ? { ...quote, customer } : quote,
    );
  }

  delete(quoteID: string) {
    return defer(() => {
      this.quotes = this.quotes.filter((item) => item.quoteID !== quoteID);
      return of([...this.quotes]);
    });
  }
}
