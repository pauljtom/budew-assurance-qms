import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/pages/home/home').then((m) => m.Home),
  },
  {
    path: 'customers/new',
    loadComponent: () =>
      import('./modules/pages/customers/create-customer/create-customer').then(
        (m) => m.CreateCustomer,
      ),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./modules/pages/customers/customer-list/customer-list').then((m) => m.CustomerList),
  },
  {
    path: 'quotes',
    loadComponent: () =>
      import('./modules/pages/quotes/quote-list/quote-list').then((m) => m.QuoteList),
  },
];
