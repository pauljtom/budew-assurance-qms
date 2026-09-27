import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/pages/home/home').then((m) => m.Home),
  },
  {
    path: 'customers/new',
    loadComponent: () =>
      import('./modules/pages/create-customer/create-customer').then((m) => m.CreateCustomer),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./modules/pages/customer-management-component/customer-management-component').then(
        (m) => m.CustomerManagementComponent,
      ),
  },
  {
    path: 'quotes',
    loadComponent: () =>
      import('./modules/pages/quote-management-component/quote-management-component').then(
        (m) => m.QuoteManagementComponent,
      ),
  },
];
